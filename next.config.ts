import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isPRPreview = process.env.BASE_PATH !== undefined;

const basePath = isPRPreview
  ? process.env.BASE_PATH                  // PR preview: /pr-preview-test/pr-preview/pr-42
  : isGitHubActions
  ? "/pr-preview-test"                     // Main deploy on GitHub Actions
  : "";                                    // Local dev: no basePath

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? basePath + "/" : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;