/** @type {import('tailwindcss').Config} */

const flowbite = require("flowbite-react/tailwind");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      margin: {
        'mobile': 'calc(-50px + 50vw)',
      },
      spacing: {
        'desktop': 'calc(-480px + 50vw)',
      },
      colors: {
        'newBlue' : '#0532ff',
      },
      minHeight: {
        'safe-screen': 'calc(100vh - 148px - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

