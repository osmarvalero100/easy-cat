/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        editorial: ["var(--font-playfair)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      screens: {
        print: { raw: "print" },
      },
      colors: {
        linen: "#F7F5F0",
        cream: "#FAF8F5",
        warmgray: "#EFECE6",
      },
    },
  },
  plugins: [],
};
