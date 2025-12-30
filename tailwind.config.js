/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#EC4899",
        background: "#F3F4F6",
        surface: "#FFFFFF",
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        "on-background": "#1F2937",
        "on-surface": "#111827",
      },
    },
  },
  plugins: [],
}
