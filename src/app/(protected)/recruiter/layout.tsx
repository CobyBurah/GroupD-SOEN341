import { requireRecruiter } from '@/lib/recruiter'

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  await requireRecruiter()
  return <>{children}</>
}
