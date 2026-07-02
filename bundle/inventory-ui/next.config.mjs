/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Server-side fetches to the Rust backend use a self-signed cert trusted
  // via a custom https.Agent (see src/lib/backend-agent.ts) rather than a
  // global TLS bypass, so no special config is needed here.
};

export default nextConfig;
