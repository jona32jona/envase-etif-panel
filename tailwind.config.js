/** @type {import('tailwindcss').Config} */
import theme from './src/config/theme.config.js'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        background: theme.colors.background,
        text: theme.colors.text,
        text_titles: theme.colors.text_titles,
        text_secondary: theme.colors.text_secondary,
        border: theme.colors.border,
        table_odd: theme.colors.table_odd
      }
    }
  },
  plugins: [],
}

