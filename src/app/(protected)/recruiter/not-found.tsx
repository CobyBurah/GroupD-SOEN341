import Link from 'next/link'
export default function PostingNotFound() {
  return <main><h1>Posting unavailable</h1><p>This posting was removed or does not belong to your account.</p><Link href="/recruiter">Back to your postings</Link></main>
}
