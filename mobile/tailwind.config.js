/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf9',
          100: '#d1faef',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        ink: '#10201c',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 118, 110, 0.12)',
      },
    },
  },
  plugins: [],
};
