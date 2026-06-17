/** @type {import('next').NextConfig} */

// Output mode is driven by an env var so the same codebase supports:
//   NEXT_OUTPUT=standalone  -> Docker image with a Node server (docker-compose)
//   NEXT_OUTPUT=export       -> fully static site (Render Static Site / GitHub Pages / Netlify)
//   (unset)                  -> normal `next dev` / `next build`
const output = process.env.NEXT_OUTPUT;
const isExport = output === "export";

const nextConfig = {
  reactStrictMode: true,
  ...(output ? { output } : {}),
  // Static export needs unoptimized images and folder-style URLs for clean deep links.
  ...(isExport ? { trailingSlash: true, images: { unoptimized: true } } : {}),
};

module.exports = nextConfig;
