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
      },
      fontSize: {
        'ui-body': ['16px', { lineHeight: '1.6' }],
        'ui-header': ['52px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'ui-subhead': ['24px', { lineHeight: '1.4' }],
      },
      colors: {
        brand: {
          navy: '#050A18', // Deepest background (accent/footer)
          'navy-light': '#0B1736', // Lighter background/cards (accent)
          white: '#FFFFFF', // New Primary Background
          surface: '#F8FAFC', // Soft Surface Gray
          orange: '#FF7A30', // Official app orange
          yellow: '#FFCE4A', // Official app yellow
          'text-main': '#0F172A', // Slate-900 for Light Mode
          'text-dim': '#64748B', // Slate-500 for secondary text
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