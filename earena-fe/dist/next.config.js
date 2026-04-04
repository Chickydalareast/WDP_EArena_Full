"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '/**',
            }
        ],
        dangerouslyAllowSVG: true,
    },
};
exports.default = nextConfig;
//# sourceMappingURL=next.config.js.map