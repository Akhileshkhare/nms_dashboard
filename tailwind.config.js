module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2', // main blue
          dark: '#163d56',    // sidebar dark blue
          light: '#e3eaf6',   // light blue bg
        },
        sidebar: '#163d56',
        card: '#fff',
        border: '#e0e0e0',
        accent: '#2196f3',
        danger: '#d32f2f',
        warning: '#ff9800',
        success: '#388e3c',
        graybg: '#f5f7fa',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(60,72,88,0.08)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
