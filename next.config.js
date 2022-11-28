/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["daulat-nft-marketplace.infura-ipfs.io", "ipfs.io"],
  },
};

module.exports = nextConfig;
