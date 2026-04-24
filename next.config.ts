import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/cartao",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
