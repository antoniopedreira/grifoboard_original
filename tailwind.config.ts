import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // SUAS CORES NOVAS AQUI
        grifo: {
          primary: "#112232", // Azul Principal (Sidebar, Headers fortes)
          secondary: "#A47428", // Dourado (Botões, Destaques, Links)
          tertiary: "#E0D9CF", // Bege (Fundos sutis, Bordas, Cards secundários)
          background: "#F9F8F6", // Uma versão bem clara do bege para o fundo geral
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#A47428", // O anel de foco dos inputs será Dourado
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#112232", // Substitui o padrão pelo seu Azul
          foreground: "#E0D9CF",
        },
        secondary: {
          DEFAULT: "#A47428", // Substitui o padrão pelo seu Dourado
          foreground: "#ffffff",
        },
        // ... mantenha o resto das configurações (destructive, muted, etc)
      },
      // Adicionar fontes modernas se quiser
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Playfair Display", "serif"], // Opcional: Para títulos mais elegantes
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
