import dns from 'dns';

// Prioriza o IPv4 para resolver o 'localhost', evitando problemas de conexão
// com servidores locais (como o Ollama) em ambientes com IPv6.
dns.setDefaultResultOrder('ipv4first');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Aumenta o tempo limite das Server Actions para 10 minutos (600 segundos)
    // para permitir que gerações de IA mais longas sejam concluídas.
    serverActions: {
        bodyTimeout: 600
    },
  },
};

export default nextConfig;
