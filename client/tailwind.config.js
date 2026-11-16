/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          500: '#4a7c59',
          600: '#386646',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'soft': '0 4px 16px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -2px rgba(15, 23, 42, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 4px 12px -3px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 16px 32px -6px rgba(15, 23, 42, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
