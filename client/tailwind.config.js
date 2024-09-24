/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
      maxHeight: {
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px )',
      },
      minHeight: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px )',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px )',
      },
      height: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'drawer-screen': 'calc((var(--vh, 1vh) * 100) - 168px )',
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px )',
        'pending-screen': 'calc((var(--vh, 1vh) * 100) - 48px )',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px )',
      },
      zIndex: {
        '110' : '110',
      },
      borderRadius: {
        '4xl' : '2rem'
      },
      scale: {
        '98': '.98',
      }
    },
  },
  plugins: [
  ],
}

