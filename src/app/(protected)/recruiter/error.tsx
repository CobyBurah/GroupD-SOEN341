'use client'
export default function RecruiterError({ reset }: { reset: () => void }) {
  return <main><h1>Unable to load this page</h1><p>Please try again in a moment.</p><button onClick={reset}>Try again</button></main>
}
