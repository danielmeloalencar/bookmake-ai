/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb', // Aumenta o limite do corpo da requisição
            bodyTimeout: 600, // Aumenta o timeout para 600 segundos (10 minutos)
        },
    },
};

export default nextConfig;
