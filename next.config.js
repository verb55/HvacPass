const createNextIntlPlugin = require('next-intl/plugin');

// Wskazujemy palcem, gdzie dokładnie leży nasz plik i18n
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

// Eksportujemy konfigurację owiniętą we wtyczkę next-intl
module.exports = withNextIntl(nextConfig);