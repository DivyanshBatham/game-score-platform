/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flip: {
          blue: '#1e3a5f',
          'blue-light': '#2d4a6f',
          'blue-dark': '#152a45',
          yellow: '#f5c842',
          'yellow-dark': '#d4a83a',
          cream: '#f8f4e8',
          card: '#fffef7',
        },
      },
    },
  },
  plugins: [],
}

