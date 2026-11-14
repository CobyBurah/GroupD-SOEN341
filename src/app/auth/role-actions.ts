'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { isRole, roleHome } from '@/lib/profiles'
import { createClient } from '@/lib/supabase/server'

// Switch a dual-role account between job seeker and recruiter mode.
// set_active_role ignores roles the account doesn't hold.
export async function switchRole(formData: FormData) {
  const role = formData.get('role')
  if (!isRole(role)) redirect('/profile')

  const supabase = await createClient()
  const { data } = await supabase.rpc('set_active_role', { new_role: role })

  revalidatePath('/', 'layout')
  redirect(roleHome(isRole(data) ? data : role))
}

// Add the other role to the signed-in account; the user stays in their current mode.
export async function enableRole(formData: FormData) {
  const role = formData.get('role')
  if (!isRole(role)) redirect('/profile')

  const supabase = await createClient()
  const { error } = await supabase.rpc('add_role', { new_role: role })
  if (error) redirect('/profile?roleError=1')

  revalidatePath('/', 'layout')
  redirect('/profile?roleAdded=1')
}
