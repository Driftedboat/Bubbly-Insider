import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bubbly Insider | Daily Crypto Denoise Deck',
  description: 'Denoise crypto information with 10 insider cards daily. Bull/Bear signals with evidence-backed analysis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-dark text-terminal-green antialiased">
        {/* CRT Scanline Overlay */}
        <div className="crt-overlay" aria-hidden="true" />
        
        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>
        
        {/* Disclaimer Footer */}
        <footer className="fixed bottom-0 left-0 right-0 p-2 text-center text-xs text-terminal-green/40 font-terminal bg-bg-dark/80 backdrop-blur-sm border-t border-terminal-green/10">
          Informational only, not financial advice. DYOR.
        </footer>
      </body>
    </html>
  )
}
