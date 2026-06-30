const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_biblioteca_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

async function login(email, senha) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_email: email } });

  // Mensagem genérica para não revelar se o email existe
  if (!usuario) throw new Error('Credenciais inválidas');
  if (usuario.usuario_status !== 'Ativo') throw new Error('Conta inativa ou bloqueada');

  // Sempre compara com bcrypt — elimina o fallback de texto plano (inseguro)
  const senhaValida = await bcrypt.compare(senha, usuario.usuario_senha);
  if (!senhaValida) throw new Error('Credenciais inválidas');

  const token = jwt.sign(
    { id: usuario.usuario_id, tipo: usuario.usuario_tipo },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: usuario.usuario_id },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

  // Retorna dados do utilizador para o frontend — SEM a senha
  return {
    token,
    refreshToken,
    usuario: {
      usuario_id: usuario.usuario_id,
      usuario_nome: usuario.usuario_nome,
      usuario_email: usuario.usuario_email,
      usuario_tipo: usuario.usuario_tipo,
    },
  };
}

async function refresh(refreshTokenAntigo) {
  try {
    const decodificado = jwt.verify(refreshTokenAntigo, JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({ where: { usuario_id: decodificado.id } });

    if (!usuario || usuario.usuario_status !== 'Ativo') throw new Error('Utilizador inválido');

    const novoToken = jwt.sign(
      { id: usuario.usuario_id, tipo: usuario.usuario_tipo },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    return { token: novoToken };
  } catch (err) {
    throw new Error('Refresh token inválido ou expirado');
  }
}

async function validarToken(token) {
  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    return { valido: true, dados: decodificado };
  } catch (err) {
    return { valido: false };
  }
}

async function alterarSenha(usuarioId, senhaAtual, novaSenha) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_id: Number(usuarioId) } });
  if (!usuario) throw new Error('Utilizador não encontrado');

  // Sempre usa bcrypt — sem fallback de texto plano
  const senhaValida = await bcrypt.compare(senhaAtual, usuario.usuario_senha);
  if (!senhaValida) throw new Error('A palavra-passe atual está incorreta');

  const novaSenhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.usuario.update({
    where: { usuario_id: Number(usuarioId) },
    data: { usuario_senha: novaSenhaHash },
  });
}

module.exports = { login, refresh, validarToken, alterarSenha };
