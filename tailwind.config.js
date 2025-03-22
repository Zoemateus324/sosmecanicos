/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yellow: {
          400: '#FFD60A',
          500: '#E6C009',
          600: '#CC9A05',
        },
      },
    },
  },
  plugins: [],
};