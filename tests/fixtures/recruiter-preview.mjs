import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

// Local-only fake HTTP service for UI integration. Actual RLS is tested separately
// against PostgreSQL in recruiter.test.mjs. No shared Supabase project is contacted.
const userId = '00000000-0000-0000-0000-000000000001'
const owner = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'recruiter@example.test', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-10-18T00:00:00Z' }
let jobs = []
let resumes = [], resumeSeq = 0
let favourites = []
let applications = []
const storedFiles = new Map()
let server, app, appOutput = ''
let apiPort, appPort
const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) })).toString('base64url')}.local-test-signature`

const localSession = { access_token: token, refresh_token: 'local-test-refresh', expires_in: 3600, expires_at: Math.floor(Date.now()/1000)+3600, token_type: 'bearer', user: owner }

const seekerId = '00000000-0000-0000-0000-000000000003'
const seeker = { ...owner, id: seekerId, email: 'jobseeker@example.test', user_metadata: { full_name: 'Demo Job Seeker' } }
function sessionFor(user) {
  const claims = { sub: user.id, email: user.email, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now()/1000)+3600, iat: Math.floor(Date.now()/1000) }
  const access_token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.local-test-signature`
  return { ...localSession, access_token, user }
}
function requestUser(req) {
  try {
    const claims = JSON.parse(Buffer.from((req.headers.authorization ?? '').split('.')[1], 'base64url').toString())
    return claims.sub === seekerId ? seeker : owner
  } catch { return owner }
}

async function readBody(req) {
  const chunks = []; for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}
function forbidden(res) { res.statusCode = 403; return res.end(JSON.stringify({ code: '42501', message: 'new row violates row-level security policy for table "resumes"' })) }

// Resumes rows are scoped to the requesting user to mimic RLS; only job seekers may write.
async function handleResumes(req, res, url) {
  const user = requestUser(req)
  const filters = [...url.searchParams].filter(([key, value]) => !['select', 'order', 'limit', 'offset', 'columns'].includes(key) && value.startsWith('eq.'))
  const matches = row => row.user_id === user.id && filters.every(([key, value]) => String(row[key]) === value.slice(3))
  const representation = req.headers.prefer?.includes('return=representation')
  let rows
  if (req.method === 'POST') {
    if (user.id !== seekerId) return forbidden(res)
    const input = JSON.parse((await readBody(req)).toString() || '{}')
    rows = (Array.isArray(input) ? input : [input]).map(fields => {
      const now = new Date(Date.now() + resumeSeq++).toISOString()
      return { id: randomUUID(), created_at: now, updated_at: now, ...fields, user_id: user.id }
    })
    resumes.push(...rows)
  } else if (req.method === 'PATCH') {
    const fields = JSON.parse((await readBody(req)).toString() || '{}')
    rows = user.id === seekerId ? resumes.filter(matches) : []
    rows.forEach(row => Object.assign(row, fields, { id: row.id, user_id: row.user_id }))
  } else if (req.method === 'DELETE') {
    rows = user.id === seekerId ? resumes.filter(matches) : []
    resumes = resumes.filter(row => !rows.includes(row))
  } else {
    rows = resumes.filter(matches)
    const [column, direction] = (url.searchParams.get('order') ?? '').split('.')
    if (column) rows = [...rows].sort((a, b) => (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (direction === 'desc' ? -1 : 1))
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !representation) { res.statusCode = req.method === 'POST' ? 201 : 204; return res.end() }
  if (req.headers.accept?.includes('application/vnd.pgrst.object+json')) {
    if (rows.length !== 1) { res.statusCode = 406; return res.end(JSON.stringify({ code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `The result contains ${rows.length} rows` })) }
    return res.end(JSON.stringify(rows[0]))
  }
  if (req.method === 'POST') res.statusCode = 201
  res.end(JSON.stringify(rows))
}

// Minimal Storage API for the private "resumes" bucket (paths as used by @supabase/storage-js).
async function handleStorage(req, res, url) {
  const path = decodeURIComponent(url.pathname.slice('/storage/v1/object/'.length))
  if (req.method === 'DELETE' && path === 'resumes') {
    const { prefixes = [] } = JSON.parse((await readBody(req)).toString() || '{}')
    const removed = prefixes.filter(key => storedFiles.delete(key)).map(name => ({ name, bucket_id: 'resumes' }))
    return res.end(JSON.stringify(removed))
  }
  if (req.method === 'POST' && path.startsWith('list/resumes')) return res.end('[]')
  if (path.startsWith('sign/resumes/')) {
    const key = path.slice('sign/resumes/'.length)
    if (!storedFiles.has(key)) { res.statusCode = 400; return res.end(JSON.stringify({ statusCode: '404', error: 'not_found', message: 'Object not found' })) }
    if (req.method === 'POST') return res.end(JSON.stringify({ signedURL: `/object/sign/resumes/${key}?token=local-test-token` }))
    const file = storedFiles.get(key)
    res.setHeader('content-type', file.type)
    return res.end(file.bytes)
  }
  if (req.method === 'POST' && path.startsWith('resumes/')) {
    const key = path.slice('resumes/'.length)
    if (requestUser(req).id !== seekerId || !key.startsWith(`${seekerId}/`)) { res.statusCode = 403; return res.end(JSON.stringify({ statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy' })) }
    const body = await readBody(req)
    const contentType = req.headers['content-type'] ?? 'application/octet-stream'
    let file = { bytes: body, type: contentType }
    if (contentType.startsWith('multipart/form-data')) {
      const blob = [...(await new Response(body, { headers: { 'content-type': contentType } }).formData()).values()].find(value => typeof value !== 'string')
      file = { bytes: Buffer.from(await blob.arrayBuffer()), type: blob.type || 'application/octet-stream' }
    }
    storedFiles.set(key, file)
    return res.end(JSON.stringify({ Key: `resumes/${key}`, Id: randomUUID() }))
  }
  res.statusCode = 404; res.end(JSON.stringify({ statusCode: '404', error: 'not_found', message: 'Object not found' }))
}

// Favourites rows are scoped to the requesting user to mimic RLS; select=job:jobs(*) embeds the active job.
async function handleFavourites(req, res, url) {
  const user = requestUser(req)
  const filters = [...url.searchParams].filter(([key, value]) => ['user_id', 'job_id'].includes(key) && value.startsWith('eq.'))
  const matches = row => row.user_id === user.id && filters.every(([key, value]) => row[key] === value.slice(3))
  if (req.method === 'POST') {
    const fields = JSON.parse((await readBody(req)).toString() || '{}')
    const job = jobs.find(j => j.id === fields.job_id && j.deleted_at === null)
    if (user.id !== seekerId || fields.user_id !== user.id || !job) { res.statusCode = 403; return res.end(JSON.stringify({ code: '42501', message: 'new row violates row-level security policy for table "favourites"' })) }
    if (favourites.some(row => row.user_id === user.id && row.job_id === job.id)) { res.statusCode = 409; return res.end(JSON.stringify({ code: '23505', message: 'duplicate key value violates unique constraint "favourites_pkey"' })) }
    favourites.push({ user_id: user.id, job_id: job.id, created_at: new Date(Date.now() + favourites.length).toISOString() })
    res.statusCode = 201; return res.end()
  }
  if (req.method === 'DELETE') { favourites = favourites.filter(row => !matches(row)); res.statusCode = 204; return res.end() }
  const embed = (url.searchParams.get('select') ?? '').includes('jobs(')
  const rows = favourites.filter(matches).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .map(row => embed ? { created_at: row.created_at, job: jobs.find(j => j.id === row.job_id && j.deleted_at === null) ?? null } : row)
  res.end(JSON.stringify(rows))
}

// Applications mimic RLS: seekers see and withdraw their own, recruiters see and update
// status on their jobs' applications. Every status change is appended to the row's history.
async function handleApplications(req, res, url) {
  const user = requestUser(req)
  const filters = [...url.searchParams].filter(([key, value]) => ['id', 'user_id', 'job_id'].includes(key) && value.startsWith('eq.'))
  const visible = row => row.user_id === user.id || jobs.some(j => j.id === row.job_id && j.recruiter_id === user.id)
  const matches = row => visible(row) && filters.every(([key, value]) => row[key] === value.slice(3))
  const deny = () => { res.statusCode = 403; return res.end(JSON.stringify({ code: '42501', message: 'new row violates row-level security policy for table "applications"' })) }
  let rows
  if (req.method === 'POST') {
    const fields = JSON.parse((await readBody(req)).toString() || '{}')
    const job = jobs.find(j => j.id === fields.job_id && j.deleted_at === null)
    const resume = resumes.find(r => r.id === fields.resume_id && r.user_id === user.id)
    if (user.id !== seekerId || fields.user_id !== user.id || !job || !resume) return deny()
    if (applications.some(row => row.user_id === user.id && row.job_id === job.id)) { res.statusCode = 409; return res.end(JSON.stringify({ code: '23505', message: 'duplicate key value violates unique constraint "applications_job_id_user_id_key"' })) }
    const created_at = new Date(Date.now() + applications.length).toISOString()
    applications.push({ id: randomUUID(), job_id: job.id, user_id: user.id, resume_id: resume.id, status: 'Applied', created_at, history: [{ status: 'Applied', changed_at: created_at }] })
    res.statusCode = 201; return res.end()
  }
  if (req.method === 'PATCH') {
    const { status } = JSON.parse((await readBody(req)).toString() || '{}')
    rows = applications.filter(row => matches(row) && jobs.some(j => j.id === row.job_id && j.recruiter_id === user.id))
    for (const row of rows) {
      if (row.status !== status) row.history.push({ status, changed_at: new Date().toISOString() })
      row.status = status
    }
  } else if (req.method === 'DELETE') {
    rows = applications.filter(row => matches(row) && row.user_id === user.id)
    applications = applications.filter(row => !rows.includes(row))
  } else {
    rows = applications.filter(matches).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }
  const select = url.searchParams.get('select') ?? ''
  res.end(JSON.stringify(rows.map(({ history, ...row }) => ({
    ...row,
    ...(select.includes('jobs(') && { job: jobs.find(j => j.id === row.job_id && j.deleted_at === null) ?? null }),
    ...(select.includes('resumes(') && { resume: (r => r ? { id: r.id, file_name: r.file_name } : null)(resumes.find(r => r.id === row.resume_id)) }),
    ...(select.includes('application_status_history(') && { history }),
  }))))
}

export async function startPreview({ paginateJobs = false } = {}) {
  jobs = []; resumes = []; resumeSeq = 0; favourites = []; applications = []; storedFiles.clear()
  server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    res.setHeader('content-type', 'application/json')
    if (url.pathname === '/auth/v1/token') {
      let body = ''; for await (const chunk of req) body += chunk
      const input = JSON.parse(body || '{}')
      if (url.searchParams.get('grant_type') === 'pkce') {
        // Default-template email links: /auth/callback exchanges the code for a session.
        if (input.auth_code === 'expired' || !input.code_verifier) {
          res.statusCode = 400
          return res.end(JSON.stringify({ code: 400, error_code: 'flow_state_not_found', msg: 'invalid flow state' }))
        }
        return res.end(JSON.stringify(sessionFor(seeker)))
      }
      return res.end(JSON.stringify(sessionFor(input.email === seeker.email ? seeker : owner)))
    }
    if (url.pathname === '/auth/v1/logout') { res.statusCode = 204; return res.end() }
    if (url.pathname === '/auth/v1/recover') return res.end('{}')
    if (url.pathname === '/auth/v1/verify') {
      // Recovery email links: any token_hash except "expired" signs in the demo job seeker.
      let body = ''; for await (const chunk of req) body += chunk
      if (JSON.parse(body || '{}').token_hash === 'expired') {
        res.statusCode = 403
        return res.end(JSON.stringify({ code: 403, error_code: 'otp_expired', msg: 'Email link is invalid or has expired' }))
      }
      return res.end(JSON.stringify(sessionFor(seeker)))
    }
    if (url.pathname === '/auth/v1/user') return res.end(JSON.stringify(requestUser(req)))
    if (url.pathname === '/rest/v1/profiles') {
      const user = requestUser(req)
      // Recruiters list applicants with id=in.(...): answer with the seeker's profile.
      if (url.searchParams.get('id')?.startsWith('in.')) {
        return res.end(JSON.stringify(url.searchParams.get('id').includes(seekerId) ? [{ id: seekerId, full_name: 'Demo Job Seeker', headline: '', location: '' }] : []))
      }
      return res.end(JSON.stringify({ id: user.id, role: user.id === seekerId ? 'job_seeker' : 'recruiter', full_name: user.id === seekerId ? 'Demo Job Seeker' : 'Demo Recruiter', headline: '', location: '', bio: '' }))
    }
    if (url.pathname === '/rest/v1/resumes') return handleResumes(req, res, url)
    if (url.pathname.startsWith('/storage/v1/object/')) return handleStorage(req, res, url)
    if (url.pathname === '/rest/v1/applications') return handleApplications(req, res, url)
    if (url.pathname === '/rest/v1/favourites') return handleFavourites(req, res, url)
    if (url.pathname !== '/rest/v1/jobs') { res.statusCode = 404; return res.end('{}') }
    const matches = job => ['id', 'recruiter_id'].every(field => !url.searchParams.has(field) || url.searchParams.get(field) === `eq.${job[field]}`)
      && (url.searchParams.get('deleted_at') !== 'is.null' || job.deleted_at === null)
    let rows
    if (req.method === 'POST' || req.method === 'PATCH') {
      let body = ''; for await (const chunk of req) body += chunk
      const fields = JSON.parse(body)
      if (req.method === 'POST') {
        const created = { ...fields, id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null }
        jobs.push(created); rows = [created]
      } else {
        rows = jobs.filter(matches)
        rows.forEach(job => Object.assign(job, fields))
      }
    } else rows = jobs.filter(matches)
    if (req.headers.accept?.includes('application/vnd.pgrst.object+json')) {
      if (rows.length !== 1) { res.statusCode = 406; return res.end(JSON.stringify({ code: 'PGRST116', message: 'No rows', details: 'The result contains 0 rows' })) }
      return res.end(JSON.stringify(rows[0]))
    }
    if (paginateJobs && req.method === 'GET') {
      const matchesLike = (value, pattern) => {
        const escaped = pattern.replace(/^"|"$/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`^${escaped.replaceAll('%', '.*').replaceAll('_', '.')}$`, 'i').test(value ?? '')
      }
      for (const column of ['category', 'employment_type', 'workplace_type']) {
        const filter = url.searchParams.get(column)
        if (filter?.startsWith('in.(')) {
          const values = filter.slice(4, -1).split(',').map(value => value.replace(/^"|"$/g, ''))
          rows = rows.filter(row => values.includes(row[column]))
        }
      }
      const location = url.searchParams.get('location')
      if (location?.startsWith('ilike.')) rows = rows.filter(row => matchesLike(row.location, location.slice(6)))
      const keyword = url.searchParams.get('or')
      if (keyword) {
        const conditions = keyword.slice(1, -1).split(',').map(condition => condition.split('.ilike.'))
        rows = rows.filter(row => conditions.some(([column, pattern]) => matchesLike(row[column], pattern)))
      }
      const total = rows.length
      const ordering = (url.searchParams.get('order') ?? '').split(',').filter(Boolean).map(value => value.split('.'))
      if (ordering.length) rows = [...rows].sort((a, b) => {
        for (const [column, direction] of ordering) {
          const comparison = (a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0) * (direction === 'desc' ? -1 : 1)
          if (comparison) return comparison
        }
        return 0
      })
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? total)
      rows = rows.slice(offset, offset + limit)
      if (req.headers.prefer?.includes('count=exact')) {
        res.setHeader('content-range', `${rows.length ? `${offset}-${offset + rows.length - 1}` : '*'}/${total}`)
      }
    }
    res.end(JSON.stringify(rows))
  })
  apiPort = Number(process.env.E2E_SUPABASE_PORT ?? 54329)
await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(apiPort, '127.0.0.1', () => {
    server.off('error', reject)
    resolve()
  })
})
  const reservation = createServer()
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
  appPort = reservation.address().port
  await new Promise(resolve => reservation.close(resolve))
  app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(appPort)], {
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${apiPort}`, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'local-test-key' },
  })
  app.stdout.on('data', chunk => { appOutput += chunk })
  app.stderr.on('data', chunk => { appOutput += chunk })
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { const response = await fetch(`http://127.0.0.1:${appPort}/login`); if (response.ok) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  if (!ready) throw new Error(appOutput)
  return { appPort, apiPort, session: localSession, close: async () => { app?.kill(); await new Promise(resolve => server.close(resolve)) } }
}

if (process.argv.includes('--serve')) {
  const preview = await startPreview()
  console.log(`Local fixture preview: http://127.0.0.1:${preview.appPort}`)
  console.log('Sign in with recruiter@example.test or jobseeker@example.test and any password. Uses synthetic local data only.')
  process.on('SIGTERM', async () => { await preview.close(); process.exit(0) })
}
