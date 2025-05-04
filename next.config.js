/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "quirky-kepler1-l67ud.dev-2.tempolabs.ai",
      "irvbpfbrhrtdjvikziqe.supabase.co",
      "images.dailynewsegypt.com",
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", // Local development
        "*.app.github.dev", // GitHub Codespaces forwarded domains
        // Add other forwarded domains if needed (e.g., ngrok, localtunnel)
      ],
    },
  },
};

// Conditionally add swcPlugins for Tempo DevTools
if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental.swcPlugins = [
    [require.resolve("tempo-devtools/swc/0.90"), {}], // For Next.js 15+
  ];
}

module.exports = nextConfig;