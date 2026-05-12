const prisma = require('../utils/prisma');
const { publish, EVENTS } = require('../config/rabbitmq');

async function listar() {
  return prisma.usuario.findMany();
}

async function criar(dados) {
  const usuario = await prisma.usuario.create({
    data: {
      usuario_nome: dados.nome,           // Corrigido de 'nome' para 'usuario_nome'
      usuario_email: dados.email,         // Corrigido de 'email' para 'usuario_email'
      usuario_senha: dados.senha,         // Corrigido de 'senha' para 'usuario_senha'
      usuario_tipo: dados.tipo || 'Leitor',
      usuario_status: 'Ativo',
      usuario_data_cadastro: new Date(),  // Campo obrigatório no schema
      endereco_id: dados.endereco_id,     // Campo obrigatório (FK)
      telefone_id: dados.telefone_id      // Campo obrigatório (FK)
    }
  });

  await publish(EVENTS.USUARIO_CRIADO, {
    usuarioId: usuario.usuario_id,        // Corrigido para usuario_id
    email: usuario.usuario_email,         // Corrigido para usuario_email
    timestamp: new Date().toISOString()
  });

  return usuario;
}

async function alterarStatus(id, status) {
  const usuario = await prisma.usuario.update({
    where: { usuario_id: Number(id) },    // Corrigido para usuario_id
    data: { usuario_status: status }      // Corrigido para usuario_status
  });

  await publish(EVENTS.USUARIO_STATUS_ALTERADO, {
    usuarioId: usuario.usuario_id,        // Corrigido para usuario_id
    novoStatus: status,
    timestamp: new Date().toISOString()
  });

  return usuario;
}

module.exports = { listar, criar, alterarStatus };