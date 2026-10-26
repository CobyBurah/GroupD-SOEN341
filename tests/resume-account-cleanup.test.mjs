import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

let client
globalThis.__accountCleanupTest = {
  createClient: async () => client,
  RESUME_BUCKET: 'resumes',
  redirect(url) { throw new Error('REDIRECT:' + url) },
}
let source = await readFile(new URL('../src/app/(protected)/profile/actions.ts', import.meta.url), 'utf8')
source = source.replace(/^import .* from .*$/gm, '')
source = `const { createClient, RESUME_BUCKET, redirect } = globalThis.__accountCleanupTest;\n${source}`
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { deleteAccount } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function setup({ blocked = false } = {}) {
  const calls = []
  let files = Array.from({ length: 205 }, (_, i) => ({ name: `${i}.pdf` }))
  client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'owner' } } }), signOut: async () => calls.push('signOut') },
    from(table) { return { delete() { return this }, eq: async (field, value) => { assert.equal(field, 'user_id'); assert.equal(value, 'owner'); calls.push('delete:' + table); return { error: null } } } },
    storage: { from() { return {
      list: async (user, options) => { assert.equal(user, 'owner'); assert.equal(options.limit, 100); calls.push('list'); return { data: files.slice(0, 100), error: null } },
      remove: async paths => {
        calls.push('remove:' + paths.length)
        assert.deepEqual(calls.slice(0, 2), ['delete:applications', 'delete:resumes'])
        if (blocked) return { data: [], error: null }
        files = files.filter(file => !paths.includes(`owner/${file.name}`))
        return { data: paths.map(name => ({ name })), error: null }
      },
    } } },
    rpc: async name => { calls.push(name); return { error: null } },
  }
  return calls
}

test('account deletion releases references before removing all pages of retained files', async () => {
  const calls = setup()
  const form = new FormData(); form.set('confirmDelete', 'on')
  await assert.rejects(deleteAccount({}, form), /REDIRECT:\//)
  assert.deepEqual(calls, ['delete:applications', 'delete:resumes', 'list', 'remove:100', 'list', 'remove:100', 'list', 'remove:5', 'list', 'delete_own_account', 'signOut'])
})

test('account deletion stops on incomplete file cleanup and still requires confirmation', async () => {
  const calls = setup({ blocked: true })
  assert.match((await deleteAccount({}, new FormData())).message, /Confirm/)
  assert.deepEqual(calls, [])
  const form = new FormData(); form.set('confirmDelete', 'on')
  assert.match((await deleteAccount({}, form)).message, /Could not remove all/)
  assert.equal(calls.includes('delete_own_account'), false)
  assert.equal(calls.filter(call => call === 'list').length, 1)
})
