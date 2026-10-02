/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "sand-bg": "#EED8B8",
        "card-surface": "#FBF5EC",
        "card-surface-alt": "#F3E3CE",
        "card-surface-low": "#E5CBAC",
        "sidebar-bg": "#211914",
        "sidebar-surface": "#2D231C",
        "primary": "#D9531E",
        "primary-hover": "#C24513",
        "primary-light": "#FDECE5",
        "terracotta": "#E05A1B",
        "desert-dark": "#25170B",
        "desert-muted": "#6E5B4B",
        "desert-border": "#DFCCA9",
        "sage": "#3F685E",
        "sage-light": "#E3EEEB"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Hanken Grotesk", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
