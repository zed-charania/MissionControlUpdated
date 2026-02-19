import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#0b0f17',
        'surface-1': '#10141e',
        'surface-2': '#161b27',
        'surface-3': '#1c2333',
        border: 'rgba(255,255,255,0.08)',
        'border-bright': 'rgba(255,255,255,0.12)',
        accent: '#6366f1',
        'accent-muted': '#4f46e5',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
