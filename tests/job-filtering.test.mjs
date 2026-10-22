import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(new URL('../src/lib/job-filtering.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { jobFilterKey, parseJobFilterKey, normalizeFilterOrder } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

test('active filters keep the order they were selected in', () => {
  const order = [
    jobFilterKey('employmentType', 'part_time'),
    jobFilterKey('category', 'Marketing'),
    jobFilterKey('workplaceType', 'hybrid'),
  ]

  const result = normalizeFilterOrder(order, ['Marketing'], ['part_time'], ['hybrid'])

  assert.deepEqual(result, [
    'employmentType:part_time',
    'category:Marketing',
    'workplaceType:hybrid',
  ])
})

test('removed filters disappear and newly selected filters are added last', () => {
  const order = [
    'employmentType:part_time',
    'category:Marketing',
    'workplaceType:hybrid',
  ]

  const removed = normalizeFilterOrder(order, [], ['part_time'], ['hybrid'])
  assert.deepEqual(removed, ['employmentType:part_time', 'workplaceType:hybrid'])

  const addedAgain = normalizeFilterOrder(removed, ['Marketing'], ['part_time'], ['hybrid'])
  assert.deepEqual(addedAgain, ['employmentType:part_time', 'workplaceType:hybrid', 'category:Marketing'])
})

test('filter keys can be read back into their type and value', () => {
  assert.deepEqual(parseJobFilterKey('category:Software Development'), {
    type: 'category',
    value: 'Software Development',
  })
})