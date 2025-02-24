/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        inriaSans: ["Inria Sans", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        openSans: ["Open Sans", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        domine: ["Domine", "serif"],
        sourceCodePro: ["Source Code Pro", "monospace"],
        firaCode: ["Fira Code", "serif"],

      },
      colors: {
        success: "#47D764",
        error: "#FF355B",
        warning: "#FFC021",
        info: "#2F86EB",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "80%": { transform: "translateX(-5%)", opacity: "0.8" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out": {
          "30%": { transform: "translateX(-5%)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.5s ease-out forwards",
        "slide-out": "slide-out 0.5s ease-in forwards",
        "fade-out": "fade-out 0.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};
