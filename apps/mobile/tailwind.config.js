/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        green: {
          100: '#2b7860',
          200: '#04ad79',
          300: '#d8fdf2',
          400: '#f5fffc',
        },
        blue: {
          100: '#2c5282',
          200: '#3182ce',
          300: '#bee3f8',
          400: '#ebf8ff',
        },
        red: {
          100: '#9b2c2c',
          200: '#e53e3e',
          300: '#fed7d7',
          400: '#fff5f5',
        },
        yellow: {
          100: '#975a16',
          200: '#facd1d',
          300: '#fefcbf',
          400: '#fffff0',
        },
        indigo: {
          100: '#434190',
          200: '#667eea',
          300: '#c3dafe',
          400: '#ebf4ff',
        },
        gray: {
          50: '#f8f9fa',
          100: '#131317',
          200: '#49494d',
          300: '#bbbbbc',
          400: '#e8e8e9',
          500: '#eceff1',
          600: '#374151',
          700: '#1f2937',
          800: '#111827',
          900: '#030712',
        },
        cyan: {
          100: '#045d73',
          200: '#0bc5ea',
          300: '#cffafe',
          400: '#e0fcff',
        },
        light: '#f9fafb',
        "dark-surface": '#1a1a1e',
        dark: {
          DEFAULT: '#111827',
          100: '#28282c',
          200: '#1a1a1e',
        },
      },
    },
  },
  plugins: [],
}
