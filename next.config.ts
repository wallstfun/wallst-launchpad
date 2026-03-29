import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose RPC URL to the browser
  env: {
    NEXT_PUBLIC_RPC_URL:
      process.env.NEXT_PUBLIC_RPC_URL ||
      "https://api.devnet.solana.com",
  },

  // pg must stay on the server — never bundle it for the browser
  serverExternalPackages: ["pg"],

  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // Polyfill Node built-ins required by @solana/web3.js and Raydium SDK
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      // Inject Buffer globally (required by @solana/web3.js)
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
