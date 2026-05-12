const ctrl = require('../controllers/usuarioController');

async function usuarioRoutes(fastify) {
  fastify.get('/', ctrl.listar);
  fastify.post('/', ctrl.criar);
  fastify.patch('/:id/status', ctrl.alterarStatus);
}

module.exports = usuarioRoutes;