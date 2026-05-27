/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          600: '#0284c7',
          800: '#075985',
        },
      },
    },
  },
  plugins: [],
};
