const nextConfig = {
  async rewrites() {
    return {
      // Antes da rota dinâmica [slug]: a página estática substitui a vitrine padrão
      beforeFiles: [
        { source: '/luizfvieirah', destination: '/luizfvieirah/index.html' },
        { source: '/luizfvieirah/en', destination: '/luizfvieirah/en.html' },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;