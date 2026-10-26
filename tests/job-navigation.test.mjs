import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/job-navigation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { getJobsReturnUrl } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('return URLs preserve listing pages and repeated search/filter values', () => {
  for (const url of ['/jobs', '/jobs?page=3', '/jobs?keyword=C%2B%2B&location=Montreal&category=Software&category=Marketing&employmentType=full_time&workplaceType=hybrid&filterOrder=category%3ASoftware&page=3']) {
    assert.equal(getJobsReturnUrl(url), url)
  }
})

test('missing, ambiguous, external and non-listing return URLs fall back to jobs', () => {
  for (const value of [undefined, '', ['/jobs?page=3', 'https://example.com'], 'https://example.com/jobs', '//example.com/jobs', 'javascript:alert(1)', '/jobs/../login', '/jobs/123', '/jobs-elsewhere', '/jobs\\..\\login', '/%6aobs?page=3']) {
    assert.equal(getJobsReturnUrl(value), '/jobs')
  }
})
