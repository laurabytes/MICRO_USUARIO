const Fastify = require('fastify');
const cors = require('@fastify/cors');
const usuarioRoutes = require('./routes/usuarios');
const authRoutes = require('./routes/auth');
const prismaPlugin = require('./plugins/prisma');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_biblioteca_2026';
function buildApp(opts = {}) {
  const fastify = Fastify({ logger: true, ...opts });
  fastify.register(cors, { origin: true, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] });
  fastify.register(prismaPlugin);
  fastify.addHook('onRequest', async (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try { req.usuario = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET); } catch {}
    }
  });
  fastify.get('/health', async () => ({ status: 'ok', servico: 'usuarios' }));
  fastify.register(usuarioRoutes, { prefix: '/usuarios' });
  fastify.register(authRoutes, { prefix: '/auth' });
  return fastify;
}
module.exports = buildApp;
