import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Compile the pure helpers with the project's TypeScript version, no app server required.
const source = await readFile(new URL('../src/lib/passwords.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { validateNewPassword, safeNextPath } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
function form(password, confirmPassword = password) {
  const data = new FormData()
  data.set('password', password)
  data.set('confirmPassword', confirmPassword)
  return data
}

test('new password must be at least 8 characters and match its confirmation', () => {
  assert.deepEqual(validateNewPassword(form('long-enough')), { password: 'long-enough', errors: {}, valid: true })
  const short = validateNewPassword(form('short'))
  assert.equal(short.valid, false)
  assert.match(short.errors.password, /at least 8/)
  const mismatch = validateNewPassword(form('long-enough', 'different-one'))
  assert.equal(mismatch.valid, false)
  assert.equal(mismatch.errors.confirmPassword, 'Passwords do not match.')
  assert.equal(validateNewPassword(new FormData()).valid, false)
})

test('email link redirects stay on this site', () => {
  assert.equal(safeNextPath('/reset-password'), '/reset-password')
  assert.equal(safeNextPath('/dashboard?tab=1'), '/dashboard?tab=1')
  for (const unsafe of [null, '', 'https://evil.example', '//evil.example', '/\\evil.example', 'reset-password']) {
    assert.equal(safeNextPath(unsafe), '/')
  }
  assert.equal(safeNextPath(null, '/dashboard'), '/dashboard')
})
