/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode toggling via class
  theme: {
    extend: {
      colors: {
        'brick-yellow': '#FFCE4A',
        'brick-blue': '#7AC7FF',
        'brick-pink': '#FF9AA2',
        'brick-green': '#C9F2A6',
      },
      borderRadius: {
        'brick': '16px',
        'brick-lg': '24px',
        'brick-xl': '28px',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scan': 'scan 2s linear infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

