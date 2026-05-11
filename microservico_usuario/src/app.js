const Fastify = require('fastify');
const usuarioRoutes = require('./routes/usuarios');
const prismaPlugin = require('./plugins/prisma');

function buildApp(opts = {}) {
  const fastify = Fastify({ logger: true, ...opts });

  // Plugin do Prisma (cria o ficheiro abaixo no passo 4)
  fastify.register(prismaPlugin);

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', servico: 'usuarios' }));

  // Registo de Rotas
  fastify.register(usuarioRoutes, { prefix: '/usuarios' });

  return fastify;
}

module.exports = buildApp;