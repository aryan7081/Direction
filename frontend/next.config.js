/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  skipTrailingSlashRedirect: true,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  experimental: {
    optimizePackageImports: ["@mui/material"],
  },

  // Google Sign-In: COOP allows the OAuth popup to postMessage back to the opener.
  // Apply only in production — in dev, this header breaks Next.js internals (e.g.
  // _devMiddlewareManifest fetches) and can show "Failed to fetch" / odd 404s in
  // Chrome device toolbar / responsive mode.
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const base = apiUrl.replace(/\/api\/?$/, "");

    return [
      {
        source: "/api/:path*/",
        destination: `${base}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;