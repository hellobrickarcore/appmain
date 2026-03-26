/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Newsreader"', 'serif'],
      },
      fontSize: {
        'ui-s': ['13px', { lineHeight: '1.2' }],
        'ui-m': ['18px', { lineHeight: '1.6' }],
        'ui-l': ['90px', { lineHeight: '0.92' }],
      },
      colors: {
        brand: {
          navy: '#050A18', // Deepest background
          'navy-light': '#0B1736', // Lighter background/cards
          orange: '#FF7A30', // Official app orange
          yellow: '#FFCE4A', // Official app yellow
          'text-dim': '#94A3B8', // Muted text
        }
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}