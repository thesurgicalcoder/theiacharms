/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { brand: { burgundy: '#6B1028', wine: '#4B1020', deepwine: '#330814', gold: '#C49A55', goldlight: '#DFBD7E', blush: '#F7E5E0', cream: '#FFF9F5', softpink: '#FAECE9', dark: '#2A1B1E' } },
      fontFamily: { serif: ['"Playfair Display"', 'Georgia', 'serif'], sans: ['Poppins', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
