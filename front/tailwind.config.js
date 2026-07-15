/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ziv-navy': '#0A1E4A',
        'ziv-cyan': '#00A8B5',
        'ziv-blue': '#1D4ED8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(0, 168, 181, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 15px rgba(0, 168, 181, 0)' },
          '100%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(0, 168, 181, 0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s infinite',
        scroll: 'scroll 40s linear infinite',
        blob: 'blob 7s infinite',
      },
    },
  },
  plugins: [],
};
