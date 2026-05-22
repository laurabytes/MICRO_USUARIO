const authService = require('../services/authService');
const { validarLogin, validarAlterarSenha } = require('../utils/validation');

async function login(req, reply) {
  try {
    validarLogin(req.body);
    const { email, senha } = req.body;
    const data = await authService.login(email, senha);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(401).send({ success: false, error: error.message });
  }
}

async function refresh(req, reply) {
  try {
    if (!req.body?.token) {
      return reply.status(400).send({ success: false, error: 'token é obrigatório' });
    }
    const data = await authService.refresh(req.body.token);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(401).send({ success: false, error: error.message });
  }
}

async function validarToken(req, reply) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
  if (!token) return reply.status(400).send({ success: false, error: 'Token não fornecido' });

  const data = await authService.validarToken(token);

  // Retorna 401 se inválido, 200 se válido
  if (!data.valido) {
    return reply.status(401).send({ success: false, data });
  }
  return reply.send({ success: true, data });
}

async function alterarSenha(req, reply) {
  try {
    validarAlterarSenha(req.body);
    const { senhaatual, novasenha } = req.body;
    await authService.alterarSenha(req.params.id, senhaatual, novasenha);
    return reply.send({ success: true, message: 'Palavra-passe alterada com sucesso' });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

module.exports = { login, refresh, validarToken, alterarSenha };
