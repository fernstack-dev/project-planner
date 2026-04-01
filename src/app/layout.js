// app/layout.js - UPDATED
import { Inter } from 'next/font/google'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/providers/SessionProvider";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'Projify - Планировщик проектов',
  description: 'Современный планировщик проектов с канбан-доской',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider session={session}>
          <AppHeader />
          <main className="min-h-screen">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}

