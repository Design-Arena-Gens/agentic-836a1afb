import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tic-Tac-Toe Global Leaderboard',
  description: 'Play Tic-Tac-Toe and compete on the global leaderboard',
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
