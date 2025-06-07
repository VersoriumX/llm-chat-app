import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import vite.config from "vite.config.ts"

installGlobals();

export default defineConfig({
  plugins: [remix({ presets: [Preset()] }), tsconfigPaths()],
});
