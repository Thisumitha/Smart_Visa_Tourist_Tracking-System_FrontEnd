/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme glass tokens
        glass: "rgba(255, 255, 255, 0.72)",
        glassborder: "rgba(15, 23, 42, 0.08)",
        surface: "rgba(248, 250, 252, 0.85)",
        navpill: "rgba(255, 255, 255, 0.82)",
        // Muted accent for active nav states
        accent: {
          muted: "rgba(71, 85, 105, 0.10)",
          active: "rgba(51, 65, 85, 0.12)",
        }
      },
      backdropBlur: {
        xs: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'pill': '0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 4px rgba(15, 23, 42, 0.04)',
        'card': '0 2px 16px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
