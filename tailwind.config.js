/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        paper: 'hsl(var(--paper))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        accent: 'hsl(var(--accent))',
        ink: 'hsl(var(--ink))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        // Logo-inspired colors
        'padeliga-orange': 'hsl(var(--orange))',
        'padeliga-teal': 'hsl(var(--teal))',
        'padeliga-purple': 'hsl(var(--purple))',
        'padeliga-green': 'hsl(var(--green))',
        'padeliga-red': 'hsl(var(--red))',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delay-1': 'float 7s ease-in-out 1s infinite',
        'float-delay-2': 'float 8s ease-in-out 2s infinite',
        'float-delay-3': 'float 9s ease-in-out 3s infinite',
        'float-delay-4': 'float 10s ease-in-out 4s infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-right': 'slideRight 0.7s ease-out forwards',
        'slide-down': 'slideDown 0.7s ease-out forwards',
        'shape-appear': 'shapeAppear 0.4s ease-out forwards',
        'diagonal-stripe': 'diagonalStripe 1.2s ease-in-out infinite'
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%) skew(12deg)' },
          '100%': { transform: 'translateX(0) skew(12deg)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%) skew(-12deg)' },
          '100%': { transform: 'translateY(0) skew(-12deg)' },
        },
        shapeAppear: {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        diagonalStripe: {
          '0%': { transform: 'translateX(-100%) skew(-45deg)' },
          '100%': { transform: 'translateX(300%) skew(-45deg)' }
        }
      },
      boxShadow: {
        'colored': '0 4px 14px 0 rgba(var(--accent-rgb), 0.15)',
        'colored-lg': '0 10px 25px -3px rgba(var(--accent-rgb), 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'radial-gradient-purple': 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(102,71,142,0) 70%)',
        'radial-gradient-teal': 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(53,121,179,0) 70%)',
      },
      rotate: {
        '15': '15deg',
        '30': '30deg',
        '45': '45deg',
      },
      skew: {
        '45': '45deg',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}