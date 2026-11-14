'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { isRole, roleHome, type Role } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-casting for convenience; add proper input validation later.
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: auth, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  // "Log in as": dual-role accounts switch to the chosen mode. Single-role
  // accounts are unaffected because set_active_role ignores roles they don't hold.
  const requested = formData.get('role')
  let active: Role | null = null
  if (isRole(requested)) {
    const { data: result } = await supabase.rpc('set_active_role', { new_role: requested })
    if (isRole(result)) active = result
  }
  if (!active) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single()
    active = isRole(profile?.role) ? profile.role : 'job_seeker'
  }

  revalidatePath('/', 'layout')
  redirect(roleHome(active))
}
