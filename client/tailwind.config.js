/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pgGreen: {
          50: '#f2f9f1',
          100: '#e1f3de',
          200: '#c5e7bf',
          500: '#54b045',
          600: '#3e8f31',
          700: '#2e6f24',
          800: '#1b4315',
          accent: '#8bc34a', // Soft lime green matching building
        },
        pgYellow: {
          400: '#ffd54f',
          500: '#ffc107',
          600: '#ffa000',
          accent: '#fbc02d', // Bright yellow accent
        },
        pgOrange: {
          500: '#ff6f00', // Pillar orange
          600: '#e65100',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
