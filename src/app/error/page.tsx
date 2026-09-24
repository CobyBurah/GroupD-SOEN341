import Link from 'next/link'

export default function ErrorPage() {
  return (
    <main>
      <p>Sorry, something went wrong</p>
      <Link href="/login">Back to log in</Link>
    </main>
  )
}
