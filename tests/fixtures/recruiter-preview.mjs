import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

// Local-only fake HTTP service for UI integration. Actual RLS is tested separately
// against PostgreSQL in recruiter.test.mjs. No shared Supabase project is contacted.
const userId = '00000000-0000-0000-0000-000000000001'
const owner = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'recruiter@example.test', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-10-18T00:00:00Z' }
let jobs = []
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

export async function startPreview() {
  server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    res.setHeader('content-type', 'application/json')
    if (url.pathname === '/auth/v1/token') {
      let body = ''; for await (const chunk of req) body += chunk
      const input = JSON.parse(body || '{}')
      return res.end(JSON.stringify(sessionFor(input.email === seeker.email ? seeker : owner)))
    }
    if (url.pathname === '/auth/v1/logout') { res.statusCode = 204; return res.end() }
    if (url.pathname === '/auth/v1/user') return res.end(JSON.stringify(requestUser(req)))
    if (url.pathname === '/rest/v1/profiles') {
      const user = requestUser(req)
      return res.end(JSON.stringify({ id: user.id, role: user.id === seekerId ? 'job_seeker' : 'recruiter', full_name: user.id === seekerId ? 'Demo Job Seeker' : 'Demo Recruiter', headline: '', location: '', bio: '' }))
    }
    if (url.pathname === '/rest/v1/resumes') return res.end('[]')
    if (url.pathname === '/rest/v1/applications') return res.end('[]')
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
    res.end(JSON.stringify(rows))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  apiPort = server.address().port
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
  return { appPort, session: localSession, close: async () => { app?.kill(); await new Promise(resolve => server.close(resolve)) } }
}

if (process.argv.includes('--serve')) {
  const preview = await startPreview()
  console.log(`Local fixture preview: http://127.0.0.1:${preview.appPort}`)
  console.log('Sign in with recruiter@example.test or jobseeker@example.test and any password. Uses synthetic local data only.')
  process.on('SIGTERM', async () => { await preview.close(); process.exit(0) })
}
