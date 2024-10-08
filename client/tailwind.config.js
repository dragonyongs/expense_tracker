/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'flip-once': 'flip-once 0.5s ease-in-out forwards', // 한 번만 플립되는 애니메이션
      },
      keyframes: {
        'flip-once': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-text': 'linear-gradient(to right, #1e3a8a, #9333ea)', // 원하는 그라데이션 색상 설정
      },
      textColor: {
        'gradient': 'transparent',
      },
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
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 77px )',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px )',
      },
      height: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'drawer-screen': 'calc((var(--vh, 1vh) * 100) - 168px )',
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px )',
        'pending-screen': 'calc((var(--vh, 1vh) * 100) - 48px )',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px )',
        'profile-screen': 'calc((var(--vh, 1vh) * 100) - 44px )',
        'profileDrawer-screen': 'calc((var(--vh, 1vh) * 100) - 159px )',
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
  variants: {
    extend: {
      backgroundClip: ['responsive', 'hover', 'focus'],
    },
  },
  plugins: [
  ],
}

