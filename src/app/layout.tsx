import type { Metadata } from 'next'

import './globals.css'
import { SiteHeader } from './site-header'
import styles from './ui.module.css'

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
      <body>
        <div className={styles.shell}>
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  )
}
