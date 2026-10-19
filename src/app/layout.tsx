import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google' // Google fonts used across the whole app for headings and body text

import './globals.css'
import { SiteHeader } from './site-header'
import styles from './ui.module.css'

// Montserrat is used for headings, Inter for body text. Both expose a CSS
// variable so ui.module.css can reference them without re-importing fonts.
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

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
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <div className={styles.shell}>
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  )
}
