/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#B35A27",      // Laranja queimado (escurecido de #D87943 para contraste AA 4.76:1 com branco)
        secondary: "#527575",    // Verde petróleo
        tertiary: "#FBCC97",     // Areia
        background: "#FFFFFF",   // Branco
        muted: "#F3F4F6",        // Cinza claro
        foreground: "#111827",   // Grafite
        border: "#E5E7EB",       // Cinza borda
        destructive: "#DC4545",  // Vermelho
      },
    },
  },
  plugins: [],
}