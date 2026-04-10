import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jbMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jb-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RentaGraph — Base de conocimiento IRPF con IA',
  description: 'Consulta la Declaración de la Renta española con IA. Base de conocimiento compilada automáticamente. No es asesoría fiscal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${dmSerif.variable} ${dmSans.variable} ${jbMono.variable}`}
    >
      <body className="h-screen flex flex-col overflow-hidden">
        <DisclaimerBanner />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
