/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": ["./public/assets/media/**/*"],
    "/**": ["./public/assets/media/**/*"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
