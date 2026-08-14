/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#7c3aed",
        accent2: "#ff3b82",
        accent3: "#06b6d4",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 8px 32px rgba(17,17,20,.08), 0 1px 3px rgba(0,0,0,.06)",
      },
    },
  },
  plugins: [],
};
