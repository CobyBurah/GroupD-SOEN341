import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { createClient } from '@supabase/supabase-js'
import ts from 'typescript'
import { matchesLike, matchesJobSearch, parseJobSearchFilter } from './fixtures/job-search.mjs'

// Exercise the real Supabase URL builder and PostgreSQL ILIKE, without contacting Supabase.
const db = new PGlite()
const requests = []
const columns = ['title', 'company', 'category', 'location']
const jobs = [
  ['developer', 'Developer'], ['senior', 'Senior Developer'],
  ['percent', '100% Guaranteed Engineer'], ['percent-decoy', '1000 Guaranteed Engineer'],
  ['underscore', 'data_engineer'], ['underscore-decoy', 'dataXengineer'],
  ['backslash', 'C:\\tools\\ Engineer'], ['backslash-decoy', 'C:tools Engineer'],
  ['comma', 'Research, Development'], ['comma-decoy', 'Research Development'],
  ['parentheses', 'Engineer (Platform)'], ['parentheses-decoy', 'Engineer Platform'],
  ['single-quote', "O'Reilly Engineer"], ['double-quote', '"Quoted" Engineer'],
  ['escape-quote', 'Slash \\" Engineer'],
  ['injection', 'x",company.ilike.%,title.ilike."'],
  ['full-time', 'Employment Test'], ['onsite', 'Workplace Test'],
].map(([id, title]) => ({ id, title, company: 'Acme', category: 'Software', location: 'Montreal', employment_type: id === 'full-time' ? 'full_time' : 'contract', workplace_type: id === 'onsite' ? 'onsite' : 'hybrid' }))
for (let index = 0; index < 25; index++) {
  jobs.push({ id: `paged-${String(index).padStart(2, '0')}`, title: `Paged 100% Engineer ${index}`, company: 'Acme', category: 'Software', location: 'Montreal', employment_type: 'full_time', workplace_type: 'hybrid' })
}
jobs.push({ ...jobs.at(-1), id: 'wrong-filter', category: 'Marketing' })
jobs.push({ ...jobs.at(-1), id: 'archived', category: 'Software', archived_at: '2026-01-01T00:00:00Z' })
jobs.push({ ...jobs.at(-1), id: 'deleted', archived_at: null, deleted_at: '2026-01-01T00:00:00Z' })

const client = createClient('http://127.0.0.1:54329', 'local-test-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: async input => {
    const url = new URL(input)
    requests.push(url)
    const values = []
    const where = []
    const parameter = value => { values.push(value); return `$${values.length}` }
    const matchSql = (column, operator, pattern) => `${column} ${operator === 'imatch' ? '~*' : 'ILIKE'} ${parameter(operator === 'ilike' ? pattern.replaceAll('*', '%') : pattern)}`
    try {
      for (const column of ['deleted_at', 'archived_at']) {
        if (url.searchParams.get(column) === 'is.null') where.push(`${column} IS NULL`)
      }
      for (const group of url.searchParams.getAll('or')) {
        const conditions = parseJobSearchFilter(group)
        assert.ok(conditions.length >= 4 && conditions.length <= 6)
        assert.deepEqual(conditions.filter(item => item.operator !== 'in').map(item => item.column), columns)
        where.push('(' + conditions.map(({ column, operator, pattern, values: selected }) => {
          if (operator !== 'in') return matchSql(column, operator, pattern)
          assert.ok(['employment_type', 'workplace_type'].includes(column))
          return `${column} = ANY(${parameter(selected)}::text[])`
        }).join(' OR ') + ')')
      }
      const location = url.searchParams.get('location')
      if (location) {
        const match = /^(ilike|imatch)\.(.*)$/s.exec(location)
        assert.ok(match)
        where.push(matchSql('location', match[1], match[2]))
      }
      for (const column of ['category', 'employment_type', 'workplace_type']) {
        const filter = url.searchParams.get(column)
        if (filter) {
          assert.match(filter, /^in\.\(.*\)$/)
          const selected = filter.slice(4, -1).split(',')
          where.push(`${column} = ANY(${parameter(selected)}::text[])`)
        }
      }
      const predicate = where.length ? `WHERE ${where.join(' AND ')}` : ''
      const { rows: [{ total }] } = await db.query(`SELECT count(*)::int AS total FROM jobs ${predicate}`, values)
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 10)
      const { rows } = await db.query(`SELECT * FROM jobs ${predicate} ORDER BY created_at DESC, id ASC LIMIT ${limit} OFFSET ${offset}`, values)
      return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json', 'content-range': `${offset}-${offset + rows.length - 1}/${total}` } })
    } catch (error) {
      return new Response(JSON.stringify({ code: 'PGRST100', message: error.message }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
  } },
})

globalThis.__jobSearchTest = { createClient: async () => client }
let source = await readFile(new URL('../src/lib/jobs.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { createClient } = globalThis.__jobSearchTest;\n${source}`
const postingSource = await readFile(new URL('../src/lib/job-posting.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(postingSource + '\n' + source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { getJobs, normalizeSearchText, escapeLikePattern } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

before(async () => {
  await db.exec(`CREATE TABLE jobs (
    id text PRIMARY KEY, title text, company text, category text, location text,
    employment_type text, workplace_type text, created_at timestamptz DEFAULT '2026-01-01',
    archived_at timestamptz, deleted_at timestamptz
  )`)
  for (const job of jobs) {
    await db.query('INSERT INTO jobs (id,title,company,category,location,employment_type,workplace_type,archived_at,deleted_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [job.id, job.title, job.company, job.category, job.location, job.employment_type, job.workplace_type, job.archived_at ?? null, job.deleted_at ?? null])
  }
})
after(async () => { await db.close() })

for (const [name, keyword, expected, total = expected.length] of [
  ['surrounding spaces', '  developer  ', ['developer', 'senior']],
  ['repeated internal whitespace', ' \tSenior   Developer\n ', ['senior']],
  ['literal percent', '100% Guaranteed', ['percent']],
  ['literal underscore', 'data_', ['underscore']],
  ['literal backslash', '\\', ['backslash', 'escape-quote']],
  ['trailing backslash', 'C:\\tools\\', ['backslash']],
  ['commas', 'Research, Development', ['comma']],
  ['parentheses', '(Platform)', ['parentheses']],
  ['single quotes', "O'Reilly", ['single-quote']],
  ['double quotes', '"Quoted"', ['double-quote']],
  ['backslash followed by a quote', '\\"', ['escape-quote']],
  ['filter-shaped input stays literal', 'x",company.ilike.%,title.ilike."', ['injection']],
  ['ordinary case-insensitive keywords', 'dEvElOpEr', ['developer', 'senior']],
  ['employment type words', '  full   time ', ['full-time', ...Array.from({ length: 9 }, (_, index) => `paged-${String(index).padStart(2, '0')}`)], 27],
  ['workplace hyphens', ' On-site ', ['onsite']],
  ['workplace spaces', ' on   site ', ['onsite']],
]) {
  test(`search handles ${name} through Supabase and PostgreSQL`, async () => {
    const result = await getJobs(keyword)
    assert.deepEqual(result.jobs.map(job => job.id), expected)
    assert.equal(result.total, total)
  })
}

test('whitespace-only searches behave like an empty keyword', async () => {
  const empty = await getJobs()
  requests.length = 0
  assert.deepEqual(await getJobs(' \t\n '), empty)
  assert.equal(requests.at(-1).searchParams.has('or'), false)
})

test('normalization and SQL escaping preserve literal punctuation', () => {
  assert.equal(normalizeSearchText('  Senior \t Developer \n'), 'Senior Developer')
  assert.equal(escapeLikePattern('100% data_file\\path'), '100\\% data\\_file\\\\path')
  assert.equal(escapeLikePattern('"O\'Reilly", (C++)'), '"O\'Reilly", (C++)')
})

test('literal keyword search combines filters and retains safe pagination and archived/deleted exclusions', async () => {
  const search = page => getJobs('  Paged   100%  ', 'Montreal', ['Software'], ['full_time'], ['hybrid'], page)
  for (const [page, expectedPage, start, end] of [[1, 1, 0, 10], [2, 2, 10, 20], [3, 3, 20, 25], [999, 1, 0, 10]]) {
    const result = await search(page)
    assert.equal(result.page, expectedPage)
    assert.equal(result.total, 25)
    assert.deepEqual(result.jobs.map(job => job.id), Array.from({ length: end - start }, (_, index) => `paged-${String(start + index).padStart(2, '0')}`))
  }
  assert.equal((await getJobs('Paged 100%', 'Toronto', ['Software'], ['full_time'], ['hybrid'])).total, 0)
  assert.equal((await getJobs('Paged 100%', 'Montreal', ['Software'], ['contract'], ['hybrid'])).total, 0)
  assert.equal((await getJobs('Paged 100%', 'Montreal', ['Software'], ['full_time'], ['remote'])).total, 0)
})

test('the browser fixture decodes quoted values before evaluating SQL LIKE escapes', async () => {
  const [condition] = parseJobSearchFilter('(title.ilike."%100\\\\% \\"quoted\\", (C++)%")')
  assert.equal(condition.pattern, '%100\\% "quoted", (C++)%')
  for (const [value, pattern, expected] of [
    ['100%', '%100\\%%', true], ['1000', '%100\\%%', false],
    ['data_file', '%data\\_file%', true], ['dataXfile', '%data\\_file%', false],
    ['C:\\tools', '%C:\\\\tools%', true], ['C:tools', '%C:\\\\tools%', false],
    [null, '%', false], ['Developer', '%developer%', true],
  ]) {
    assert.equal(matchesLike(value, pattern), expected)
    const { rows: [{ matches }] } = await db.query('SELECT $1::text ILIKE $2 AS matches', [value, pattern])
    assert.equal(matches ?? false, expected)
  }
  assert.throws(() => parseJobSearchFilter('(title.ilike."unterminated)'))
})

async function withSearchJobs(rows, run) {
  try {
    for (const fields of rows) {
      const job = { title: 'Location fixture', company: 'Acme', category: 'Software', location: 'Montreal', employment_type: 'contract', workplace_type: 'hybrid', ...fields }
      await db.query('INSERT INTO jobs (id,title,company,category,location,employment_type,workplace_type) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [job.id, job.title, job.company, job.category, job.location, job.employment_type, job.workplace_type])
    }
    await run()
  } finally {
    await db.query('DELETE FROM jobs WHERE id = ANY($1::text[])', [rows.map(row => row.id)])
  }
}

for (const symbol of ['_', '%', '\\']) {
  test('symbol-only keyword ' + symbol + ' ignores hidden type identifiers and requires visible literal text', async () => {
    await withSearchJobs([{
      id: 'qa-s4-literal-symbol',
      title: 'QA-S4 Junior TypeScript Developer (edited)',
      category: 'Symbol regression',
      employment_type: 'full_time',
      workplace_type: 'onsite',
    }], async () => {
      const result = await getJobs(symbol, '', ['Symbol regression'])
      assert.deepEqual(result.jobs, [])
      assert.equal(result.total, 0)
      const conditions = parseJobSearchFilter(requests.at(-1).searchParams.get('or'))
      assert.deepEqual(conditions.map(condition => condition.column), columns)
      const expectedPattern = { _: '%\\_%', '%': '%\\%%', '\\': '%\\\\%' }[symbol]
      for (const condition of conditions) assert.equal(condition.pattern, expectedPattern)
    })
  })
  test('symbol-only keyword ' + symbol + ' matches actual literals in each searchable text field', async () => {
    const rows = columns.map(column => ({
      id: 'literal-field-' + column,
      employment_type: 'full_time',
      location: 'RegressionCity',
      [column]: column === 'location' ? 'RegressionCity ' + symbol : 'Literal ' + symbol,
    }))
    rows.push({ id: 'literal-field-negative', title: 'QA-S4 Junior TypeScript Developer (edited)', employment_type: 'full_time', location: 'RegressionCity' })
    await withSearchJobs(rows, async () => {
      const result = await getJobs(symbol, 'RegressionCity')
      assert.deepEqual(result.jobs.map(job => job.id), rows.slice(0, 4).map(row => row.id).sort())
      assert.equal(result.total, 4)
    })
  })
}

test('type keywords search visible labels while literal underscores do not match storage IDs', async () => {
  await withSearchJobs([
    { id: 'type-full', employment_type: 'full_time', location: 'RegressionCity' },
    { id: 'type-part', employment_type: 'part_time', location: 'RegressionCity' },
    { id: 'type-contract', employment_type: 'contract', location: 'RegressionCity' },
  ], async () => {
    const result = await getJobs('time', 'RegressionCity')
    assert.deepEqual(result.jobs.map(job => job.id), ['type-full', 'type-part'])
    assert.equal(result.total, 2)
    const typeCondition = parseJobSearchFilter(requests.at(-1).searchParams.get('or')).find(condition => condition.column === 'employment_type')
    assert.deepEqual(typeCondition, { column: 'employment_type', operator: 'in', values: ['full_time', 'part_time'] })
    assert.equal((await getJobs('_', 'RegressionCity')).total, 0)
    assert.deepEqual((await getJobs('full time', 'RegressionCity')).jobs.map(job => job.id), ['type-full'])
    assert.deepEqual((await getJobs('part time', 'RegressionCity')).jobs.map(job => job.id), ['type-part'])
  })
})

for (const [name, input] of [['surrounding spaces', '  New York  '], ['repeated whitespace', 'New \t  York']]) {
  test('location normalizes ' + name, async () => {
    await withSearchJobs([{ id: 'location-spaces', location: 'New York' }, { id: 'location-decoy', location: 'NewYork' }], async () => {
      const result = await getJobs('', input)
      assert.deepEqual(result.jobs.map(job => job.id), ['location-spaces'])
      assert.equal(result.total, 1)
    })
  })
}

test('location searches percent, underscore, backslash, punctuation and asterisk literally', async () => {
  await withSearchJobs([
    { id: 'location-percent', location: 'Sector 100%' }, { id: 'location-percent-decoy', location: 'Sector 1000' },
    { id: 'location-underscore', location: 'Zone_A' }, { id: 'location-underscore-decoy', location: 'ZoneXA' },
    { id: 'location-backslash', location: 'C:\\Sites' }, { id: 'location-backslash-decoy', location: 'C:Sites' },
    { id: 'location-punctuation', location: 'O\'Reilly, ("East")' },
    { id: 'location-star', location: 'District *' }, { id: 'location-star-decoy', location: 'District X' },
  ], async () => {
    for (const [input, expected] of [['%', 'location-percent'], ['_', 'location-underscore'], ['\\', 'location-backslash'], ['O\'Reilly, ("East")', 'location-punctuation'], ['*', 'location-star']]) {
      const result = await getJobs('', input)
      assert.deepEqual(result.jobs.map(job => job.id), [expected])
      assert.equal(result.total, 1)
    }
    assert.equal((await getJobs('Location fixture', '*', ['Software'], ['contract'], ['hybrid'])).total, 1)
  })
})

test('whitespace-only locations do not add a location filter', async () => {
  const empty = await getJobs()
  requests.length = 0
  assert.deepEqual(await getJobs('', ' \t '), empty)
  assert.equal(requests.at(-1).searchParams.has('location'), false)
})

test('asterisks and regex punctuation remain literal in keyword and location searches', async () => {
  const title = 'Meta [x].+?^$(){}|\\*" 100%_'
  const location = 'District [east].+?^$(){}|\\*" 100%_'
  await withSearchJobs([
    { id: 'literal-star', title: 'A*Star Engineer' }, { id: 'literal-star-decoy', title: 'AXStar Engineer' },
    { id: 'literal-meta', title, location }, { id: 'literal-meta-decoy', title: 'Meta anything', location: 'District east' },
  ], async () => {
    for (const [keyword, ids] of [['*', ['literal-meta', 'literal-star']], ['A*Star', ['literal-star']], [title.toLowerCase(), ['literal-meta']]]) {
      const result = await getJobs(keyword)
      assert.deepEqual(result.jobs.map(job => job.id), ids)
      assert.equal(result.total, ids.length)
      const [condition] = parseJobSearchFilter(requests.at(-1).searchParams.get('or'))
      assert.equal(condition.operator, 'imatch')
      assert.equal(matchesJobSearch(keyword === '*' ? 'A*Star Engineer' : keyword, condition), true)
      assert.equal(matchesJobSearch('Meta anything', condition), false)
    }
    assert.deepEqual((await getJobs('', location.toLowerCase())).jobs.map(job => job.id), ['literal-meta'])
  })
})

test('literal asterisk searches keep filtered counts and pagination correct', async () => {
  const rows = Array.from({ length: 25 }, (_, index) => ({ id: 'star-page-' + String(index).padStart(2, '0'), title: 'Star * Engineer ' + index, employment_type: 'full_time' }))
  rows.push({ id: 'star-page-decoy', title: 'Star X Engineer', employment_type: 'full_time' })
  rows.push({ id: 'star-page-filter-decoy', title: 'Star * Engineer', employment_type: 'full_time', category: 'Marketing' })
  await withSearchJobs(rows, async () => {
    for (const [page, expectedPage, start, end] of [[1, 1, 0, 10], [2, 2, 10, 20], [3, 3, 20, 25], [999, 1, 0, 10]]) {
      const result = await getJobs(' Star *   Engineer ', ' Montreal ', ['Software'], ['full_time'], ['hybrid'], page)
      assert.equal(result.page, expectedPage)
      assert.equal(result.total, 25)
      assert.deepEqual(result.jobs.map(job => job.id), rows.slice(start, end).map(job => job.id))
    }
  })
})
