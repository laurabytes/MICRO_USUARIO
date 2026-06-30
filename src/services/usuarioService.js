const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const { publish, EVENTS } = require('../config/rabbitmq');

// Campos seguros para retornar — nunca expõe a senha
const CAMPOS_SEGUROS = {
  usuario_id: true,
  usuario_nome: true,
  usuario_email: true,
  usuario_tipo: true,
  usuario_status: true,
  usuario_data_cadastro: true,
  endereco_id: true,
  telefone_id: true,
};

// Lista apenas os ativos (sem senha)
async function listar() {
  return prisma.usuario.findMany({
    where: { usuario_status: 'Ativo' },
    select: CAMPOS_SEGUROS,
  });
}

// Traz o usuario com endereco e telefone, sem senha
async function obterPorId(id) {
  return prisma.usuario.findUnique({
    where: { usuario_id: Number(id) },
    select: {
      ...CAMPOS_SEGUROS,
      endereco: true,
      telefone: true,
    },
  });
}

// Cria o usuario com senha em hash e relações de endereço/telefone
async function criar(dados) {
  // Gera o hash da senha antes de salvar
  const senhaHash = await bcrypt.hash(dados.senha, 12);

  const usuario = await prisma.usuario.create({
    data: {
      usuario_nome: dados.nome,
      usuario_email: dados.email,
      usuario_senha: senhaHash,
      usuario_tipo: dados.tipo || 'Leitor',
      usuario_status: dados.status || 'Ativo',
      usuario_data_cadastro: new Date(),

      endereco: {
        create: {
          endereco_rua: dados.endereco?.rua || 'Não informado',
          endereco_numero: dados.endereco?.numero || 'S/N',
          endereco_complemento: dados.endereco?.complemento || null,
          endereco_bairro: dados.endereco?.bairro || null,
          endereco_cidade: dados.endereco?.cidade || 'Não informado',
          endereco_estado: dados.endereco?.estado || 'NI',
          endereco_cep: dados.endereco?.cep || '00000000',
        },
      },
      telefone: {
        create: {
          telefone_numero: dados.telefone?.numero || '000000000',
          telefone_tipo: dados.telefone?.tipo || 'Celular',
        },
      },
    },
    select: CAMPOS_SEGUROS,
  });

  // Avisa na fila do RabbitMQ
  await publish(EVENTS.USUARIO_CRIADO, {
    usuarioId: usuario.usuario_id,
    email: usuario.usuario_email,
    timestamp: new Date().toISOString(),
  });

  return usuario;
}

// Atualiza dados base (sem permitir alterar senha por aqui)
async function atualizar(id, dados) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: {
      usuario_nome: dados.nome,
      usuario_email: dados.email,
      usuario_tipo: dados.tipo,
    },
    select: CAMPOS_SEGUROS,
  });
}

// Muda o status (ex: Bloqueado, Inativo)
async function alterarStatus(id, status) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: { usuario_status: status },
    select: CAMPOS_SEGUROS,
  });
}

// Apaga fisicamente do banco
async function remover(id) {
  return prisma.usuario.delete({ where: { usuario_id: Number(id) } });
}

// Retorna o endereço vinculado ao utilizador
async function listarEnderecos(id) {
  const u = await prisma.usuario.findUnique({
    where: { usuario_id: Number(id) },
    include: { endereco: true },
  });
  return u && u.endereco ? [u.endereco] : [];
}

// Atualiza o endereço vinculado ao utilizador
async function atualizarEndereco(usuarioId, dadosEndereco) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_id: Number(usuarioId) } });
  if (!usuario) throw new Error('Utilizador não encontrado');
  return prisma.endereco.update({
    where: { endereco_id: usuario.endereco_id },
    data: {
      endereco_rua: dadosEndereco.rua,
      endereco_numero: dadosEndereco.numero,
      endereco_complemento: dadosEndereco.complemento || null,
      endereco_bairro: dadosEndereco.bairro || null,
      endereco_cidade: dadosEndereco.cidade,
      endereco_estado: dadosEndereco.estado,
      endereco_cep: dadosEndereco.cep,
    },
  });
}

// Simula remoção de endereço voltando para dados padrão
async function limparEndereco(usuarioId) {
  return atualizarEndereco(usuarioId, {
    rua: 'Não informado', numero: 'S/N', cidade: 'Não informado', estado: 'NI', cep: '00000000',
  });
}

// Retorna o telefone vinculado ao utilizador
async function listarTelefones(id) {
  const u = await prisma.usuario.findUnique({
    where: { usuario_id: Number(id) },
    include: { telefone: true },
  });
  return u && u.telefone ? [u.telefone] : [];
}

// Atualiza o telefone vinculado ao utilizador
async function atualizarTelefone(usuarioId, dadosTelefone) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_id: Number(usuarioId) } });
  if (!usuario) throw new Error('Utilizador não encontrado');
  return prisma.telefone.update({
    where: { telefone_id: usuario.telefone_id },
    data: { telefone_numero: dadosTelefone.numero, telefone_tipo: dadosTelefone.tipo },
  });
}

// Simula remoção de telefone voltando para dados padrão
async function limparTelefone(usuarioId) {
  return atualizarTelefone(usuarioId, { numero: '000000000', tipo: 'Celular' });
}

// Busca por email — NÃO retorna a senha
async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({
    where: { usuario_email: email },
    select: CAMPOS_SEGUROS,
  });
}

// Lista inativos e bloqueados
async function listarInativos() {
  return prisma.usuario.findMany({
    where: { usuario_status: { in: ['Inativo', 'Bloqueado'] } },
    select: CAMPOS_SEGUROS,
  });
}

// Muda de Leitor para Bibliotecario e vice-versa
async function atualizarCargo(id, novoTipo) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: { usuario_tipo: novoTipo },
    select: CAMPOS_SEGUROS,
  });
}

// Placeholder — tabela de logs ainda não existe no banco
async function obterLogs(id) {
  return [];
}

// === foto de perfil ===

// salva a foto do usuario no banco como base64 (mesmo padrao do catalogo)
async function atualizarFoto(id, imagemBuffer, extensao, imagemNome) {
  const contentType = extensao === 'png' ? 'image/png' : 'image/jpeg';
  const base64 = imagemBuffer.toString('base64');
  const prefixo = `data:${contentType};base64,`;
  const base64ComPrefixo = prefixo + base64;

  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: {
      usuario_imagem: Buffer.from(base64ComPrefixo, 'utf-8'),
      usuario_extensao: extensao,
      usuario_imagem_nome: imagemNome
    }
  });
}

// retorna os dados da foto do usuario
async function obterFoto(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { usuario_id: Number(id) },
    select: { usuario_imagem: true, usuario_extensao: true, usuario_imagem_nome: true, usuario_nome: true }
  });
  return usuario;
}

module.exports = {
  listar, obterPorId, criar, atualizar, alterarStatus, remover,
  listarEnderecos, atualizarEndereco, limparEndereco,
  listarTelefones, atualizarTelefone, limparTelefone,
  buscarPorEmail, listarInativos, atualizarCargo, obterLogs,
  atualizarFoto, obterFoto
};
