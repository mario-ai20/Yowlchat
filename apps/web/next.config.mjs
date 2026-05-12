/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    optimizePackageImports: ["lucide-react"]
  },
  transpilePackages: ["@yowl/ui", "@yowl/types", "@yowl/config"]
};

export default nextConfig;
