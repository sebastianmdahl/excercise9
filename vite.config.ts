import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/excercise9/", // ✅ Set this to match your GitHub repo name
});
