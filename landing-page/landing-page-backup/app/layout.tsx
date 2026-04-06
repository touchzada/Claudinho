import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Claudinho - Terminal de IA em Português',
  description: 'Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE. Use GPT-4o, DeepSeek, Gemini, Llama e 200+ modelos no terminal.',
  keywords: 'IA, terminal, GPT-4, DeepSeek, Gemini, Llama, português, open source, CLI',
  authors: [{ name: 'touchzada' }],
  openGraph: {
    title: 'Claudinho - Terminal de IA em Português',
    description: 'Qualquer provedor. Qualquer modelo. De graça, PRA SEMPRE.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
