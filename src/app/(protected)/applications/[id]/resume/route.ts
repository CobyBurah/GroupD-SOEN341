import { notFound, redirect } from 'next/navigation'

import { isJobId } from '@/lib/job-posting'
import { RESUME_BUCKET } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

// Layouts do not secure route handlers. This session-scoped query relies on
// application RLS for both the applicant and the owning recruiter.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isJobId(id)) notFound()
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims.sub) notFound()
  const { data: application, error } = await supabase.from('applications')
    .select('submitted_resume_path').eq('id', id).single()
  if (error || !application?.submitted_resume_path) notFound()

  const { data: signed, error: signError } = await supabase.storage.from(RESUME_BUCKET)
    .createSignedUrl(application.submitted_resume_path, 60)
  if (signError || !signed) notFound()
  redirect(signed.signedUrl)
}
