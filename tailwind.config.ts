import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07140e",
        mist: "#f4f8f3",
        panel: "#fcfffb",
        line: "#d8e6d9",
        leaf: "#1d8f51",
        gold: "#d7af3f",
        pine: "#0e3823",
        ocean: "#103941",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(29, 143, 81, 0.18)",
        panel: "0 30px 80px rgba(7, 20, 14, 0.08)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(215, 175, 63, 0.18), transparent 32%), radial-gradient(circle at 12% 18%, rgba(29, 143, 81, 0.2), transparent 30%), linear-gradient(135deg, #07140e 0%, #0e3823 42%, #103941 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
