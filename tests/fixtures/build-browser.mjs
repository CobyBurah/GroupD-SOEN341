import { spawn } from 'node:child_process'

const apiPort = Number(process.env.E2E_SUPABASE_PORT ?? 54329)

const build = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'build'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${apiPort}`,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'local-test-key',
    },
  }
)

const code = await new Promise(resolve => build.on('exit', resolve))
process.exit(code ?? 1)