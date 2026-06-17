/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        li: {
          blue: "#0a66c2",
          bluehover: "#004182",
          canvas: "#f4f2ee",
          border: "#e0dfdc",
        },
      },
    },
  },
  plugins: [],
};
