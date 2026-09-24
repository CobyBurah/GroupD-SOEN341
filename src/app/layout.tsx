import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CareerConnect',
  description: 'Find jobs, manage applications, and connect with recruiters.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
