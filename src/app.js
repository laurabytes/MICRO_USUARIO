const Fastify = require('fastify');
const cors = require('@fastify/cors'); // 1. Importa o plugin de CORS
const usuarioRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth'); // Novo import para autenticação
const prismaPlugin = require('./plugins/prisma');

function buildApp(opts = {}) {
  const fastify = Fastify({ logger: true, ...opts });

  // 2. Regista o CORS antes das rotas e plugins de rotas
  fastify.register(cors, {
    origin: true, // Permite requisições de qualquer origem (essencial para o Chrome rodando local ou em outro domínio)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Libera os métodos HTTP comuns
    allowedHeaders: ['Content-Type', 'Authorization'], // Garante que headers de JSON e Tokens JWT passem sem bloqueio
  });

  // Plugin do Prisma
  fastify.register(prismaPlugin);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', servico: 'usuarios' }));

  // Registo de Rotas
  fastify.register(usuarioRoutes, { prefix: '/usuarios' });
  fastify.register(authRoutes, { prefix: '/auth' }); // Registo das rotas de login e validação

  return fastify;
}

module.exports = buildApp;