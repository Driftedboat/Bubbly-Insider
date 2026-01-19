import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bull-green': '#00ff41',
        'bull-green-dark': '#00cc33',
        'bear-red': '#ff3333',
        'bear-red-dark': '#cc2929',
        'bg-dark': '#0a0a0a',
        'bg-card': '#111111',
        'border-glow': 'rgba(0, 255, 65, 0.5)',
        'border-glow-red': 'rgba(255, 51, 51, 0.5)',
        'terminal-green': '#00ff41',
        'terminal-amber': '#ffb000',
        'terminal-cyan': '#00ffff',
      },
      fontFamily: {
        pixel: ['var(--font-press-start)', 'monospace'],
        terminal: ['var(--font-vt323)', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2)',
        'glow-red': '0 0 20px rgba(255, 51, 51, 0.4), 0 0 40px rgba(255, 51, 51, 0.2)',
        'glow-amber': '0 0 20px rgba(255, 176, 0, 0.4), 0 0 40px rgba(255, 176, 0, 0.2)',
        'card-bull': '0 0 15px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.1)',
        'card-bear': '0 0 15px rgba(255, 51, 51, 0.3), inset 0 0 30px rgba(255, 51, 51, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'card-flip': 'card-flip 0.6s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-in',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(180deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
