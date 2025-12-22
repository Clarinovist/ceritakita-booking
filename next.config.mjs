/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  // This creates a minimal production build with only necessary files
  // Reduces Docker image size by ~60%
  output: 'standalone',
};

export default nextConfig;
