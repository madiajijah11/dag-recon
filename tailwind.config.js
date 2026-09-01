/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#07090e',
          card: '#0d111a',
          border: '#1b2333',
          neonCyan: '#00f3ff',
          neonPink: '#ff0055',
          neonGreen: '#00ff66',
          neonYellow: '#ffdd00',
          neonPurple: '#a855f7',
          dim: '#4b5563',
          text: '#e2e8f0',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
};
