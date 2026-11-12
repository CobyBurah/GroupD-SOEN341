import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/job-navigation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { getJobsReturnUrl, getJobReturnLink } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('return URLs preserve listing pages and repeated search/filter values', () => {
  for (const url of ['/jobs', '/jobs?page=3', '/jobs?keyword=C%2B%2B&location=Montreal&category=Software&category=Marketing&employmentType=full_time&workplaceType=hybrid&filterOrder=category%3ASoftware&page=3']) {
    assert.equal(getJobsReturnUrl(url), url)
  }
})

test('missing, ambiguous, external and unsupported return URLs fall back to jobs', () => {
  for (const value of [undefined, '', ['/jobs?page=3', 'https://example.com'], 'https://example.com/jobs', '//example.com/jobs', 'javascript:alert(1)', '/jobs/../login', '/jobs/123', '/jobs-elsewhere', '/jobs\\..\\login', '/%6aobs?page=3', '/applications/../login', '/applications/123/resume', '/applications-elsewhere', '/applications\\..\\login', '//example.com/applications', ['/applications', '/jobs'], '/favourites/../login', '/favourites-elsewhere', '/favourites\\..\\login', 'https://example.com/favourites', '//example.com/favourites', ['/favourites', '/jobs']]) {
    assert.equal(getJobsReturnUrl(value), '/jobs')
  }
})

test('favourites return links keep their destination and use the favourites label', () => {
  for (const href of ['/favourites', '/favourites?keyword=Developer']) {
    assert.equal(getJobsReturnUrl(href), href)
    assert.deepEqual(getJobReturnLink(href), { href, label: '← Back to Favourites' })
  }
})

test('applications return links preserve status filters and use the applications label', () => {
  for (const url of ['/applications', '/applications?status=Interview', '/applications?status=Under%20Review']) {
    assert.equal(getJobsReturnUrl(url), url)
    assert.deepEqual(getJobReturnLink(url), { href: url, label: '← Back to My applications' })
  }
  assert.deepEqual(getJobReturnLink('/jobs?page=2'), { href: '/jobs?page=2', label: '← Back to Jobs' })
  assert.deepEqual(getJobReturnLink('https://example.com/applications'), { href: '/jobs', label: '← Back to Jobs' })
})
