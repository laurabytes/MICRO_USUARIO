// Validação manual sem dependência extra (compatível com Fastify schema nativo)
// Se quiser usar Yup, instale com: npm install yup

/**
 * Valida os dados de criação de usuário
 * Lança Error com mensagem descritiva se algo estiver errado
 */
function validarCriarUsuario(dados) {
  const erros = [];

  if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim().length < 2) {
    erros.push('nome: obrigatório e deve ter ao menos 2 caracteres');
  }

  if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push('email: obrigatório e deve ser um endereço válido');
  }

  if (!dados.senha || dados.senha.length < 6) {
    erros.push('senha: obrigatória e deve ter ao menos 6 caracteres');
  }

  const tiposValidos = ['Leitor', 'Bibliotecario', 'Admin'];
  if (dados.tipo && !tiposValidos.includes(dados.tipo)) {
    erros.push(`tipo: deve ser um de [${tiposValidos.join(', ')}]`);
  }

  const statusValidos = ['Ativo', 'Inativo', 'Bloqueado'];
  if (dados.status && !statusValidos.includes(dados.status)) {
    erros.push(`status: deve ser um de [${statusValidos.join(', ')}]`);
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

/**
 * Valida dados de atualização do usuário (campos opcionais, mas se enviados devem ser válidos)
 */
function validarAtualizarUsuario(dados) {
  const erros = [];

  if (dados.nome !== undefined && (typeof dados.nome !== 'string' || dados.nome.trim().length < 2)) {
    erros.push('nome: deve ter ao menos 2 caracteres');
  }

  if (dados.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push('email: deve ser um endereço válido');
  }

  const tiposValidos = ['Leitor', 'Bibliotecario', 'Admin'];
  if (dados.tipo !== undefined && !tiposValidos.includes(dados.tipo)) {
    erros.push(`tipo: deve ser um de [${tiposValidos.join(', ')}]`);
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

/**
 * Valida alteração de senha
 */
function validarAlterarSenha(dados) {
  const erros = [];

  if (!dados.senhaatual || dados.senhaatual.length < 1) {
    erros.push('senhaatual: obrigatória');
  }

  if (!dados.novasenha || dados.novasenha.length < 6) {
    erros.push('novasenha: obrigatória e deve ter ao menos 6 caracteres');
  }

  if (dados.senhaatual && dados.novasenha && dados.senhaatual === dados.novasenha) {
    erros.push('novasenha: deve ser diferente da senha atual');
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

/**
 * Valida alteração de status
 */
function validarAlterarStatus(dados) {
  const statusValidos = ['Ativo', 'Inativo', 'Bloqueado'];
  if (!dados.status || !statusValidos.includes(dados.status)) {
    throw new Error(`Dados inválidos: status deve ser um de [${statusValidos.join(', ')}]`);
  }
}

/**
 * Valida alteração de cargo
 */
function validarAtualizarCargo(dados) {
  const tiposValidos = ['Leitor', 'Bibliotecario', 'Admin'];
  if (!dados.tipo || !tiposValidos.includes(dados.tipo)) {
    throw new Error(`Dados inválidos: tipo deve ser um de [${tiposValidos.join(', ')}]`);
  }
}

/**
 * Valida endereço
 */
function validarEndereco(dados) {
  const erros = [];

  if (!dados.rua || dados.rua.trim().length < 2) {
    erros.push('rua: obrigatória');
  }
  if (!dados.numero || dados.numero.trim().length < 1) {
    erros.push('numero: obrigatório');
  }
  if (!dados.cidade || dados.cidade.trim().length < 2) {
    erros.push('cidade: obrigatória');
  }
  if (!dados.estado || dados.estado.trim().length < 2) {
    erros.push('estado: obrigatório (ex: SP)');
  }
  if (!dados.cep || !/^\d{8}$/.test(dados.cep.replace(/\D/g, ''))) {
    erros.push('cep: obrigatório e deve ter 8 dígitos');
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

/**
 * Valida telefone
 */
function validarTelefone(dados) {
  const erros = [];

  const numeroLimpo = (dados.numero || '').replace(/\D/g, '');
  if (!dados.numero || numeroLimpo.length < 8 || numeroLimpo.length > 13) {
    erros.push('numero: obrigatório (8 a 13 dígitos)');
  }

  const tiposValidos = ['Celular', 'Fixo', 'Comercial'];
  if (dados.tipo && !tiposValidos.includes(dados.tipo)) {
    erros.push(`tipo: deve ser um de [${tiposValidos.join(', ')}]`);
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

/**
 * Valida login
 */
function validarLogin(dados) {
  const erros = [];

  if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push('email: obrigatório e deve ser um endereço válido');
  }
  if (!dados.senha || dados.senha.length < 1) {
    erros.push('senha: obrigatória');
  }

  if (erros.length > 0) {
    throw new Error(`Dados inválidos: ${erros.join(' | ')}`);
  }
}

module.exports = {
  validarCriarUsuario,
  validarAtualizarUsuario,
  validarAlterarSenha,
  validarAlterarStatus,
  validarAtualizarCargo,
  validarEndereco,
  validarTelefone,
  validarLogin
};
