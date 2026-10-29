/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07090b',
          900: '#0d1013',
          850: '#13171c',
          800: '#191e24',
          700: '#232a32',
          600: '#333c47',
          500: '#4b5663',
        },
        lime: {
          DEFAULT: '#c6f948',
          400: '#d4fb6e',
          500: '#c6f948',
          600: '#a8e01f',
          700: '#7fae12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        phone: '0 40px 90px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
