import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Hono | nextjs',
  description: 'Generated by hono'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
