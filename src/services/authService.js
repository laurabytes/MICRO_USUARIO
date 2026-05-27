const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Num ambiente real, esta chave estaria no ficheiro .env
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_biblioteca_2026';

async function login(email, senha) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_email: email } });
  
  if (!usuario) throw new Error('Credenciais inválidas');
  if (usuario.usuario_status !== 'Ativo') throw new Error('Conta inativa ou bloqueada');

  const senhaValida = await bcrypt.compare(senha, usuario.usuario_senha).catch(() => false);
  const senhaEmTextoPlano = senha === usuario.usuario_senha;

  if (!senhaValida && !senhaEmTextoPlano) throw new Error('Credenciais inválidas');

  // Gera os Tokens
  const token = jwt.sign(
    { id: usuario.usuario_id, tipo: usuario.usuario_tipo }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: usuario.usuario_id }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );

  // MODIFICAÇÃO: Retorna os dados do usuário para o Frontend salvar no Contexto
  return { 
    token, 
    refreshToken,
    usuario: {
      usuario_id: usuario.usuario_id,
      usuario_nome: usuario.usuario_nome,
      usuario_email: usuario.usuario_email,
      usuario_tipo: usuario.usuario_tipo // Essencial para o seu isAdmin funcionar!
    }
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
      { expiresIn: '1h' }
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

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.usuario_senha).catch(() => false);
  const senhaEmTextoPlano = senhaAtual === usuario.usuario_senha;

  if (!senhaValida && !senhaEmTextoPlano) throw new Error('A palavra-passe atual está incorreta');

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

  return prisma.usuario.update({
    where: { usuario_id: Number(usuarioId) },
    data: { usuario_senha: novaSenhaHash }
  });
}

module.exports = { login, refresh, validarToken, alterarSenha };