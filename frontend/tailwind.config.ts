import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // In Tailwind v4, theme configuration is done via @theme in CSS files
  // See app/globals.css for theme configuration
  plugins: [],
}

export default config