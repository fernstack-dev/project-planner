// app/layout.js - UPDATED
import { Inter } from 'next/font/google'
import './globals.css'
import { AppHeader } from '@/components/app-header'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'ProjectPlanner - Планировщик проектов',
  description: 'Современный планировщик проектов с канбан-доской',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AppHeader />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

