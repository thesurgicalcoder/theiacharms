/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: '#6B1028', wine: '#4B1020', deepwine: '#330814', gold: '#C49A55', goldlight: '#DFBD7E',
          blush: '#F7E5E0', cream: '#FFF9F5', softpink: '#FAECE9', dark: '#2A1B1E',
        },
      },
      fontFamily: { serif: ['"Playfair Display"', 'Georgia', 'serif'], sans: ['Poppins', 'system-ui', 'sans-serif'], script: ['"Great Vibes"', 'cursive'] },
      keyframes: { pop: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.35)' } }, slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }, fadeUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } } },
      animation: { pop: 'pop .3s ease', slideIn: 'slideIn .3s ease', fadeUp: 'fadeUp .25s ease' },
    },
  },
  plugins: [],
};
