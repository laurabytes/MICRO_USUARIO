const ctrl = require('../controllers/usuarioController');
const authCtrl = require('../controllers/authController');
const { autenticar, somenteBibliotecario, donoOuBibliotecario } = require('../middlewares/auth');

async function usuarioRoutes(fastify) {
  // pesquisas e filtros (fica em cima pra nao dar conflito com o /:id)
  // Expõem dados de todos os usuários -> só bibliotecário
  fastify.get('/busca/email', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.buscarPorEmail);      // Rota 19
  fastify.get('/filtro/inativos', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.listarInativos);  // Rota 22

  // crud basico principal
  fastify.get('/', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.listar);                         // Rota 1
  fastify.post('/', ctrl.criar);                                                                              // Rota 2 - cadastro público (controller força tipo=Leitor para quem não é admin)
  fastify.get('/:id', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.obterPorId);                   // Rota 3
  fastify.put('/:id', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.atualizar);                    // Rota 4
  fastify.patch('/:id/status', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.alterarStatus);      // Rota 5
  fastify.delete('/:id', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.remover);                  // Rota 6

  // seguranca e operacoes especiais
  fastify.patch('/:id/senha', { preHandler: [autenticar, donoOuBibliotecario] }, authCtrl.alterarSenha);     // Rota 10/11
  fastify.patch('/:id/cargo', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.atualizarCargo);      // Rota 21 - promover/rebaixar cargo é ação admin
  fastify.get('/:id/logs', { preHandler: [autenticar, somenteBibliotecario] }, ctrl.obterLogs);              // Rota 20
  fastify.get('/:id/exportar', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.exportarDados);       // Rota 23

  // gestao de localidade e contato (adaptado pra bater os 23 endpoints da doc)
  fastify.get('/:id/enderecos', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.listarEnderecos);    // Rota 12
  fastify.post('/:id/enderecos', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.atualizarEndereco); // Rota 13 (funciona como o put por conta do banco)
  fastify.put('/:id/endereco', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.atualizarEndereco);   // Rota 14
  fastify.delete('/:id/endereco', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.limparEndereco);   // Rota 15

  fastify.get('/:id/telefones', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.listarTelefones);    // Rota 16
  fastify.post('/:id/telefones', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.atualizarTelefone); // Rota 17 (funciona como o put)
  fastify.put('/:id/telefone', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.atualizarTelefone);   // Rota 18 (extra)
  fastify.delete('/:id/telefone', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.limparTelefone);   // Rota extra/18

  // foto de perfil
  fastify.post('/:id/foto', { preHandler: [autenticar, donoOuBibliotecario] }, ctrl.uploadFoto);             // Upload de foto
  fastify.get('/:id/foto', { preHandler: [autenticar] }, ctrl.exibirFoto);                                    // Exibir foto (qualquer usuário logado)
}

module.exports = usuarioRoutes;