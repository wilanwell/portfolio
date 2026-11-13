import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Drops projects marked `"hidden": true` when content/projects.json is
 * imported, so unpublished projects never reach the browser bundle.
 */
function hideUnpublishedProjects(): Plugin {
  return {
    name: "hide-unpublished-projects",
    enforce: "pre",
    load(id) {
      if (!id.replaceAll("\\", "/").endsWith("/content/projects.json")) return;
      const projects: { hidden?: boolean }[] = JSON.parse(
        readFileSync(id, "utf8"),
      );
      return JSON.stringify(projects.filter((project) => !project.hidden));
    },
  };
}

export default defineConfig({
  plugins: [hideUnpublishedProjects(), react(), tailwindcss()],
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  build: { assetsInlineLimit: 0, sourcemap: false },
});
