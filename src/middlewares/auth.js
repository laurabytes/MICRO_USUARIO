/**
 * Middlewares de autenticação e autorização.
 *
 * Antes desta correção, o hook global em app.js apenas DECODIFICAVA o token
 * quando presente, mas nunca BLOQUEAVA a requisição quando o token estava
 * ausente/inválido, e nenhuma rota verificava o "tipo" (cargo) do usuário.
 * Resultado: qualquer pessoa (autenticada ou não) conseguia chamar endpoints
 * administrativos (listar todos os usuários, apagar contas, promover alguém
 * a Bibliotecario, ver logs, etc.) só conhecendo a URL.
 */

/**
 * Exige um JWT válido. Deve ser usado em (quase) todas as rotas autenticadas.
 */
async function autenticar(req, reply) {
  if (!req.usuario) {
    return reply.status(401).send({ success: false, error: 'Não autenticado. Faça login novamente.' });
  }
}

/**
 * Exige que o usuário autenticado seja Bibliotecario (admin).
 * Use sempre DEPOIS de `autenticar` no array de preHandlers.
 */
async function somenteBibliotecario(req, reply) {
  if (!req.usuario) {
    return reply.status(401).send({ success: false, error: 'Não autenticado. Faça login novamente.' });
  }
  if (req.usuario.tipo !== 'Bibliotecario') {
    return reply.status(403).send({ success: false, error: 'Acesso negado: ação restrita a bibliotecários.' });
  }
}

/**
 * Exige que o usuário autenticado seja o DONO do recurso (mesmo :id) ou um
 * Bibliotecario. Evita que um Leitor veja/edite dados de outro Leitor só
 * trocando o id na URL (IDOR).
 */
async function donoOuBibliotecario(req, reply) {
  if (!req.usuario) {
    return reply.status(401).send({ success: false, error: 'Não autenticado. Faça login novamente.' });
  }
  const idAlvo = String(req.params.id);
  const ehDono = String(req.usuario.id) === idAlvo;
  const ehAdmin = req.usuario.tipo === 'Bibliotecario';
  if (!ehDono && !ehAdmin) {
    return reply.status(403).send({ success: false, error: 'Acesso negado: você só pode acessar seus próprios dados.' });
  }
}

module.exports = { autenticar, somenteBibliotecario, donoOuBibliotecario };