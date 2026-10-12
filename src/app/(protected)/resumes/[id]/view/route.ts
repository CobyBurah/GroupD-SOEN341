import { notFound, redirect } from 'next/navigation'

import { RESUME_BUCKET } from '@/lib/resumes'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // RLS scopes this select to the caller's own resumes, so another user's id
  // (or a signed-out request) finds no row here and gets a 404.
  const { data: resume, error } = await supabase
    .from('resumes')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (error || !resume) {
    notFound()
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resume.storage_path, 60)

  if (signError || !signed) {
    notFound()
  }

  redirect(signed.signedUrl)
}
