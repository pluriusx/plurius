import type { Config } from 'tailwindcss'

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-work-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        text: {
          primary: '#09090B',
          secondary: '#71717A',
        },
        surface: {
          white: '#FFFFFF',
          light: '#F9FAFB',
          muted: '#F4F4F5',
        },
        accent: {
          cyan: '#0891B2',
        },
        status: {
          green: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      borderColor: {
        DEFAULT: '#E4E4E7',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
