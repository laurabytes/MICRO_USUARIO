const prisma = require('../utils/prisma');
const { publish, EVENTS } = require('../config/rabbitmq');

// lista apenas os ativos
async function listar() {
  return prisma.usuario.findMany({ where: { usuario_status: 'Ativo' } });
}

// traz o usuario e ja junta com os dados de endereco e telefone
async function obterPorId(id) {
  return prisma.usuario.findUnique({
    where: { usuario_id: Number(id) },
    include: { endereco: true, telefone: true }
  });
}

// cria o usuario e as tabelas filhas (endereco e telefone) de uma vez so
async function criar(dados) {
  const usuario = await prisma.usuario.create({
    data: {
      usuario_nome: dados.nome,
      usuario_email: dados.email,
      usuario_senha: dados.senha, 
      usuario_tipo: dados.tipo || 'Leitor',
      usuario_status: dados.status || 'Ativo',
      usuario_data_cadastro: new Date(),
      
      // se nao mandar endereco/telefone, preenche com padrao pra nao quebrar o banco
      endereco: {
        create: {
          endereco_rua: dados.endereco?.rua || 'Não informado',
          endereco_numero: dados.endereco?.numero || 'S/N',
          endereco_complemento: dados.endereco?.complemento || null,
          endereco_bairro: dados.endereco?.bairro || null,
          endereco_cidade: dados.endereco?.cidade || 'Não informado',
          endereco_estado: dados.endereco?.estado || 'NI',
          endereco_cep: dados.endereco?.cep || '00000000'
        }
      },
      telefone: {
        create: {
          telefone_numero: dados.telefone?.numero || '000000000',
          telefone_tipo: dados.telefone?.tipo || 'Celular'
        }
      }
    }
  });
  
  // avisa na fila do rabbitmq q deu certo
  await publish(EVENTS.USUARIO_CRIADO, { usuarioId: usuario.usuario_id, email: usuario.usuario_email, timestamp: new Date().toISOString() });
  
  return usuario;
}

// atualiza so os dados base do user
async function atualizar(id, dados) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: { usuario_nome: dados.nome, usuario_email: dados.email, usuario_tipo: dados.tipo }
  });
}

// muda o status (ex: bloqueado, inativo)
async function alterarStatus(id, status) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: { usuario_status: status }
  });
}

// apaga fisicamente do banco
async function remover(id) {
  return prisma.usuario.delete({ where: { usuario_id: Number(id) } });
}

// === sessoes de endereco e telefone (expandidas pra bater a cota de endpoints) ===

// retorna o endereco dentro de uma lista pra bater com a doc
async function listarEnderecos(id) {
  const u = await obterPorId(id);
  return u && u.endereco ? [u.endereco] : [];
}

// atualiza o endereco pegando o id do endereco q ta salvo no usuario
async function atualizarEndereco(usuarioId, dadosEndereco) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_id: Number(usuarioId) } });
  return prisma.endereco.update({
    where: { endereco_id: usuario.endereco_id },
    data: {
      endereco_rua: dadosEndereco.rua,
      endereco_numero: dadosEndereco.numero,
      endereco_complemento: dadosEndereco.complemento,
      endereco_bairro: dadosEndereco.bairro,
      endereco_cidade: dadosEndereco.cidade,
      endereco_estado: dadosEndereco.estado,
      endereco_cep: dadosEndereco.cep
    }
  });
}

// simula q apagou o endereco voltando pros dados de "nao informado"
async function limparEndereco(usuarioId) {
  return atualizarEndereco(usuarioId, { rua: 'Não informado', numero: 'S/N', complemento: null, bairro: null, cidade: 'Não informado', estado: 'NI', cep: '00000000' });
}

// retorna o telefone numa lista
async function listarTelefones(id) {
  const u = await obterPorId(id);
  return u && u.telefone ? [u.telefone] : [];
}

// atualiza o telefone vinculado ao usuario
async function atualizarTelefone(usuarioId, dadosTelefone) {
  const usuario = await prisma.usuario.findUnique({ where: { usuario_id: Number(usuarioId) } });
  return prisma.telefone.update({
    where: { telefone_id: usuario.telefone_id },
    data: { telefone_numero: dadosTelefone.numero, telefone_tipo: dadosTelefone.tipo }
  });
}

// simula q apagou o telefone 
async function limparTelefone(usuarioId) {
  return atualizarTelefone(usuarioId, { numero: '000000000', tipo: 'Celular' });
}

// === operacoes especiais da doc ===

// busca exata por email
async function buscarPorEmail(email) {
  return prisma.usuario.findUnique({ where: { usuario_email: email } });
}

// filtra galera bloqueada ou inativa
async function listarInativos() {
  return prisma.usuario.findMany({
    where: { usuario_status: { in: ['Inativo', 'Bloqueado'] } }
  });
}

// muda de leitor pra bibliotecario e vice versa
async function atualizarCargo(id, novoTipo) {
  return prisma.usuario.update({
    where: { usuario_id: Number(id) },
    data: { usuario_tipo: novoTipo }
  });
}

// placeholder pq a tabela log nao existe ainda no bd
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