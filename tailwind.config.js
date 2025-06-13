/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-animate":
          "linear-gradient(270deg, #667eea, #764ba2, #6b8dd6, #667eea)",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
      animation: {
        "gradient-x": "gradientX 10s ease infinite",
      },
      keyframes: {
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
