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
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'colored': '0 4px 14px 0 rgba(var(--accent-rgb), 0.15)',
        'colored-lg': '0 10px 25px -3px rgba(var(--accent-rgb), 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'padeliga-gradient': 'linear-gradient(45deg, hsl(var(--orange)), hsl(var(--teal)), hsl(var(--purple)), hsl(var(--green)), hsl(var(--red)))',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}