/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
        display: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF7A30', // Official app orange
          yellow: '#FFCE4A',
          blue: '#7AC7FF',
          pink: '#FF9AA2',
          green: '#C9F2A6',
          dark: '#050A18', // Official app navy dark
          light: '#F8FAFC'
        }
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}