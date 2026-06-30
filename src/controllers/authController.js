const authService = require('../services/authService');
const { validarLogin, validarAlterarSenha } = require('../utils/validation');

async function login(req, reply) {
  try {
    validarLogin(req.body);
    const { email, senha } = req.body;
    const data = await authService.login(email, senha);
    return reply.send({ success: true, data });
  } catch (error) {
    console.error('[Auth] Erro no login:', error.message);
    return reply.status(401).send({ success: false, error: error.message });
  }
}

async function logout(req, reply) {
  // O JWT é stateless — o logout real acontece no cliente ao apagar o token.
  // Aqui confirmamos o pedido para o frontend poder agir (limpar storage, cookie, etc.)
  // Para invalidação real de tokens, seria necessário uma blacklist (ex: Redis).
  return reply.send({ success: true, message: 'Sessão encerrada com sucesso' });
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

module.exports = { login, logout, refresh, validarToken, alterarSenha };
