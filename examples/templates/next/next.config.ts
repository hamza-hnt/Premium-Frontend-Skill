import type { NextConfig } from "next";
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: false,
};
export default config;
