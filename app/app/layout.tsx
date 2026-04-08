import type { Metadata } from 'next'
import './globals.css'
import { DisclaimerBanner } from '@/components/DisclaimerBanner'

export const metadata: Metadata = {
  title: 'RentaGraph — Base de conocimiento IRPF con IA',
  description: 'Consulta la Declaración de la Renta española con IA. Base de conocimiento compilada automáticamente. No es asesoría fiscal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="h-screen flex flex-col overflow-hidden antialiased">
        <DisclaimerBanner />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  )
}
