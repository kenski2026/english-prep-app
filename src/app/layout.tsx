import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'English Interview Prep',
  description: 'Practice interview questions with pronunciation hints for Cantonese speakers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
