import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Waste Classifier',
  description: 'Classify waste items using AI with Llama 4 Scout via Groq',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
} 