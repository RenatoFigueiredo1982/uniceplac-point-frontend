/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'uniceplac-green': '#00734F',
        'uniceplac-mint': '#B4D2C2',
        'uniceplac-orange': '#F07F3C',
        'uniceplac-purple': '#421B71',
        'uniceplac-bg': '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}