/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      screens: {
        'xs': '425px',
      },
      animation: {
        'flip-once': 'flip-once 0.5s ease-in-out forwards', // 한 번만 플립되는 애니메이션
        'pulse-expand': 'pulse-expand 1s ease-out infinite',
      },
      keyframes: {
        'flip-once': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'pulse-expand': {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(3)', opacity: '0' },
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
        'starBlue' : '#0433FF'
      },
      backgroundColor: {
        'newBlue' : '#0532ff',
        'starBlue' : '#0433FF'
      },
      maxHeight: {
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px )',
      },
      minHeight: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'profile-screen': 'calc((var(--vh, 1vh) * 100) - 44px)',
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 77px )',
        'content-screen': 'calc((var(--vh, 1vh) * 100) - 160px )',
        'contentWithTab-screen': 'calc((var(--vh, 1vh) * 100) - 240px )',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px )',
        'card-screen': 'calc((var(--vh, 1vh) * 100) - 520px )'
      },
      height: {
        'real-screen': 'calc(var(--vh, 1vh) * 100)',
        'profile-screen': 'calc((var(--vh, 1vh) * 100) - 44px)',
        'pending-screen': 'calc((var(--vh, 1vh) * 100) - 63px)',
        'dateFilter-screen': 'calc((var(--vh, 1vh) * 100) - 122px)',
        'default-screen': 'calc((var(--vh, 1vh) * 100) - 142px)',
        'FullDrawer-screen': 'calc((var(--vh, 1vh) * 100) - 164px)',
        'drawer-screen': 'calc((var(--vh, 1vh) * 100) - 196px)',
        'profileDrawerMobile-screen': 'calc((var(--vh, 1vh) * 100) - 260px)',
        'profileDrawer-screen': 'calc((var(--vh, 1vh) * 100) - 341px)',
        'dashboard-screen': 'calc((var(--vh, 1vh) * 100) - 381px)',
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

