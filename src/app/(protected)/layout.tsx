// TODO: guard these routes with supabase.auth.getClaims() in the auth UI task.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
