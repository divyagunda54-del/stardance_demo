/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7ee787',
        'secondary': '#7dd3fc',
        'dark-bg': '#0d1117',
        'dark-surface': '#161b22',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
