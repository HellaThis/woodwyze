/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // WoodWyze palette. Greens carried over from the original woodwyze.com theme.
        forest: '#22543d', // brand primary
        leaf: '#2f855a', // secondary
        sprout: '#38a169', // accent, used sparingly
        birch: '#e9d5a9', // plywood parts in drawings
        birchedge: '#b8955a',
        graphite: '#232823', // text
        paper: '#f2f5f1', // page
        rule: '#c9d3ca', // lines and borders
        mist: '#e3eae4', // quiet fills
        signal: '#b4442b', // errors and lost quotes
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
