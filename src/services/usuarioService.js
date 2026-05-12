const prisma = require('../utils/prisma');
const { publish, EVENTS } = require('../config/rabbitmq');

async function listar() {
  return prisma.usuario.findMany();
}

async function criar(dados) {
  const usuario = await prisma.usuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      tipo: dados.tipo || 'Leitor',
      status: 'Ativo'
    }
  });

  await publish(EVENTS.USUARIO_CRIADO, {
    usuarioId: usuario.id,
    email: usuario.email,
    timestamp: new Date().toISOString()
  });

  return usuario;
}

async function alterarStatus(id, status) {
  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { status }
  });

  // Notifica o microsserviço de empréstimo sobre a mudança de status
  await publish(EVENTS.USUARIO_STATUS_ALTERADO, {
    usuarioId: usuario.id,
    novoStatus: status,
    timestamp: new Date().toISOString()
  });

  return usuario;
}

module.exports = { listar, criar, alterarStatus };