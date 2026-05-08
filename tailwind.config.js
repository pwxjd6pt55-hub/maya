/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: '#BC7C7C',
        'rose-light': '#E29587',
        'rose-dark': '#8B5E5E',
        cream: '#F7F1E8',
        'deep-brown': '#0D0800',
        'warm-brown': '#1A0F00',
        'maya-brown': '#3D2B1F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
