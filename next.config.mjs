/** @type {import('next').NextConfig} */
const legacyIndexRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/index.htm", destination: "/", permanent: true },
];

const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return legacyIndexRedirects;
  },
};

export default nextConfig;
