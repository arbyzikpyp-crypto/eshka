import type { NextConfig } from "next";

const isPagesBuild = process.env.PAGES_BUILD === "true";
const basePath = isPagesBuild ? process.env.NEXT_PUBLIC_BASE_PATH || "/eshka" : "";

const nextConfig: NextConfig = {
  ...(isPagesBuild ? { output: "export", trailingSlash: true, basePath, assetPrefix: basePath } : {}),
  images: isPagesBuild ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
