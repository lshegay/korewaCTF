const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: colors.slate,
        positive: colors.green,
        urge: colors.violet,
        warning: colors.yellow,
        info: colors.blue,
        critical: colors.red,
        primary: {
          50: '#F5FFFE',
          100: '#C4FFF7',
          200: '#93FFF1',
          300: '#62FFEA',
          400: '#31FFE4',
          500: '#1AFFE0',
          600: '#00FFDD',
          700: '#00EACB',
          800: '#00D6B9',
          900: '#00C1A7',
        },
      },
    },
  },
  presets: [
    require('tailwindcss/defaultConfig'),
    require('xtendui/tailwind.preset'),
  ],
};
