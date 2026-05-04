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
        gold: '#C9A84C',
        'gold-light': '#E8C97A',
        'gold-dark': '#8B6914',
        cream: '#F7F1E8',
        'deep-brown': '#1A0F00',
        'warm-brown': '#3D2B1F',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
