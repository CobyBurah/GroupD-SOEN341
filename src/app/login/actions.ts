'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Type-casting for convenience; add proper input validation later.
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  // TODO: redirect to /dashboard once it's a real, protected page.
  redirect('/')
}

export async function signout() {
  const supabase = await createClient()

  // Clears the session cookies via the server client's setAll.
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
