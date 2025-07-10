import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["pdf-parse"], //I have no idea why this is needed, but it is required for the pdf-parse package to work in server components without it pdf-parse starts looking for a test file in the node_modules folder which does not exist
	},
};

export default nextConfig;
