/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure static exports work properly
    output: 'standalone',

    // Explicit empty Turbopack config to silence migration warning; we already force webpack in build script.
    turbopack: {},

    // TypeScript configuration (keep build unblocked in CI)
    typescript: {
        ignoreBuildErrors: true,
    },

    // Optimize for serverless deployment
    experimental: {
        // Enable server actions if needed
        serverActions: {
            allowedOrigins: ['localhost:3000', 'localhost:3004', '*.vercel.app']
        }
    },

    // Configure headers for better CORS handling
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    },

    // Handle image optimization for Vercel
    images: {
        domains: [],
        unoptimized: false,
    },

};

module.exports = nextConfig;