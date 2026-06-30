const Fastify = require('fastify');
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const usuarioRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth');
const prismaPlugin = require('./plugins/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_biblioteca_2026';

function buildApp(opts = {}) {
  const fastify = Fastify({ logger: true, ...opts });

  // CORS — permite requisições do frontend
  fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Multipart para upload de fotos
  fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });

  // Plugin do Prisma
  fastify.register(prismaPlugin);

  // Hook global: tenta decodificar o JWT em TODAS as requisições.
  fastify.addHook('onRequest', async (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        req.usuario = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
      } catch {
        // Token inválido ou expirado — req.usuario permanece undefined
      }
    }
  });

  // Health check
  fastify.get('/health', async () => ({ status: 'ok', servico: 'usuarios' }));

  // Registro das rotas
  fastify.register(usuarioRoutes, { prefix: '/usuarios' });
  fastify.register(authRoutes, { prefix: '/auth' });

  return fastify;
}

module.exports = buildApp;
