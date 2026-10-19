import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isJobId } from '@/lib/job-posting'
import type { Job } from '@/lib/jobs'

// Every action calls this independently; hiding a button is not authorization.
export async function recruiterSession() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims.sub
  if (error || !userId) return { ok: false as const, message: 'Sign in with a recruiter account to continue.' }
  const profile = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profile.error || profile.data?.role !== 'recruiter') {
    return { ok: false as const, message: 'Only recruiters can manage job postings.' }
  }
  return { ok: true as const, supabase, userId }
}

export async function requireRecruiter() {
  const session = await recruiterSession()
  if (!session.ok) redirect('/dashboard')
  return session
}

export async function ownedJob(id: string) {
  const session = await requireRecruiter()
  if (!isJobId(id)) notFound()
  const { data, error } = await session.supabase.from('jobs').select('*')
    .eq('id', id).eq('recruiter_id', session.userId).is('deleted_at', null).maybeSingle()
  if (error) throw new Error('Could not load this posting. Please try again.')
  if (!data) notFound()
  return data as Job
}
