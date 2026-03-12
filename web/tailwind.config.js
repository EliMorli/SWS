/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sws: {
          navy: '#0d1b2a',
          blue: '#1b3a5c',
          gold: '#f0a500',
          'gold-dark': '#d49400',
          light: '#f8f9ff',
        },
      },
    },
  },
  plugins: [],
}
