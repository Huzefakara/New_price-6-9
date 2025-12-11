/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ensure static exports work properly
    output: 'standalone',

    // Explicit empty Turbopack config to silence migration warning; we already force webpack in build script.
    turbopack: {},

    // ESLint configuration for production builds
    eslint: {
        // Only run ESLint on these directories during production builds
        dirs: ['src'],
        // Allow production builds to complete even if there are ESLint errors
        ignoreDuringBuilds: true,
    },

    // TypeScript configuration
    typescript: {
        // Allow production builds to complete even if there are type errors
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

    // Webpack configuration for better bundling
    webpack: (config) => {
        // Ensure proper handling of Node.js modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },
};

module.exports = nextConfig;