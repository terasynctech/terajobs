import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project URL: https://USERNAME.github.io/REPOSITORY/
  // Change this to "/terajobs/" if your repository is named terajobs.
  base: "/terajobs/"
});