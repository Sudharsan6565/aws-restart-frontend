/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ Add ts, tsx in case you switch or mix files
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(222.2, 84%, 4.9%)",
        muted: "hsl(210, 40%, 96.1%)",
        "muted-foreground": "hsl(215.4, 16.3%, 46.9%)",
        border: "hsl(214.3, 31.8%, 91.4%)",
        primary: "hsl(222.2, 47.4%, 11.2%)",
        "primary-foreground": "hsl(210, 40%, 98%)"
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem"
      },
      fontSize: {
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem"
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
      }
    },
  },
  plugins: [
    require('daisyui')
  ]
};
