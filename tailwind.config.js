/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF1F5A',
          50: '#FFE5EB',
          100: '#FFCCD8',
          200: '#FF99B1',
          300: '#FF668A',
          400: '#FF3363',
          500: '#FF1F5A',
          600: '#CC0033',
          700: '#990026',
          800: '#66001A',
          900: '#33000D',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          50: '#E6E6EB',
          100: '#CDCDD6',
          200: '#9B9BAD',
          300: '#696984',
          400: '#36365B',
          500: '#1A1A2E',
          600: '#151525',
          700: '#10101C',
          800: '#0A0A12',
          900: '#050509',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  darkMode: 'class',
}
