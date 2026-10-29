/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          600: '#0265d2',
          700: '#034ea2',
          800: '#073674',
          900: '#0f172a',
          950: '#090d16',
        },
        dataActual: '#3b82f6',        // Blue
        dataCalculated: '#8b5cf6',    // Purple
        dataForecast: '#f59e0b',      // Amber
        dataRecommendation: '#10b981',// Emerald
        dataDanger: '#ef4444',        // Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
