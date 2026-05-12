const service = require('../services/usuarioService');

async function listar(req, reply) {
  const usuarios = await service.listar();
  return reply.send({ success: true, data: usuarios });
}

async function criar(req, reply) {
  const data = await service.criar(req.body);
  return reply.code(201).send({ success: true, data });
}

async function alterarStatus(req, reply) {
  const data = await service.alterarStatus(req.params.id, req.body.status);
  return reply.send({ success: true, data });
}

module.exports = { listar, criar, alterarStatus };