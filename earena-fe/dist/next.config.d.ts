declare const nextConfig: {
    typescript: {
        ignoreBuildErrors: boolean;
    };
    images: {
        remotePatterns: {
            protocol: string;
            hostname: string;
            pathname: string;
        }[];
        dangerouslyAllowSVG: boolean;
    };
};
export default nextConfig;
