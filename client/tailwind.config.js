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
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
      },
      height: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'drawer-screen': 'calc((var(--vh, 1vh) * 100) - 168px )',
        'pending-screen': 'calc((var(--vh, 1vh) * 100) - 48px )',
      },
      zIndex: {
        '110' : '110',
      },
      borderRadius: {
        '4xl' : '2rem'
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

