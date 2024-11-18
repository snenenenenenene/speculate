/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi"],
        inter: ["Inter Tight"],
        sans: ["Satoshi"],
        mono: ["Inter Tight"],
        intergral: ["Inter Tight"],
        black: ["Sentient"],
        normal: ["Satoshi"],
        light: ["Inter Tigh"],
        bold: ["Sentient"],
        serif: ["Sentient"],
        medium: ["Inter Tight"],
        regular: ["Inter Tigh"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        draw: "draw 2s ease-out forwards",
        "draw-delayed-1": "draw 2s ease-out 0.5s forwards",
        "draw-delayed-2": "draw 2s ease-out 1s forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        draw: {
          "0%": { strokeDashoffset: "2000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      colors: {
        base: {
          10: "#FDFAFF",
          50: "#F5F2F7",
          100: "#F7F0FC",
          200: "#EBE4F0",
          300: "#E0D8E5",
          400: "#C5BCCC",
          500: "#B7ACBF",
          600: "#8F8299",
          700: "#675673",
          800: "#220A33",
          900: "#0F011A",
        },
        primary: {
          50: "#F7EDFF",
          100: "#EFD9FF",
          200: "#DFB2FF",
          300: "#CF8BFF",
          400: "#BA59FF",
          500: "#9E39E5",
          600: "#731BB2",
          700: "#3D0566",
          800: "#1E0033",
        },
      },
    },
  },
  plugins: [],
};
