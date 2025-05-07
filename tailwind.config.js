/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightBlue: '#F1F8FE',
        DarkBlue: '#0c2534',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'], 
        body: ['Open Sans', 'sans-serif'],     
      },
    },
  },
  plugins: [],
};
