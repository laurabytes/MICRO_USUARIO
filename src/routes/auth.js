const authCtrl = require('../controllers/authController');

async function authRoutes(fastify) {
  fastify.post('/login', authCtrl.login);
  fastify.post('/logout', authCtrl.logout);
  fastify.post('/refresh', authCtrl.refresh);
  fastify.post('/validate', authCtrl.validarToken);
}

module.exports = authRoutes;
