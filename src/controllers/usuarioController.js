const service = require('../services/usuarioService');
const {
  validarCriarUsuario,
  validarAtualizarUsuario,
  validarAlterarStatus,
  validarAtualizarCargo,
  validarEndereco,
  validarTelefone
} = require('../utils/validation');

async function listar(req, reply) {
  try {
    const usuarios = await service.listar();
    return reply.send({ success: true, data: usuarios });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function obterPorId(req, reply) {
  try {
    const usuario = await service.obterPorId(req.params.id);
    if (!usuario) return reply.status(404).send({ success: false, message: 'Utilizador não encontrado' });
    return reply.send({ success: true, data: usuario });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function criar(req, reply) {
  try {
    validarCriarUsuario(req.body);
    const data = await service.criar(req.body);
    return reply.code(201).send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function atualizar(req, reply) {
  try {
    validarAtualizarUsuario(req.body);
    const data = await service.atualizar(req.params.id, req.body);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function alterarStatus(req, reply) {
  try {
    validarAlterarStatus(req.body);
    const data = await service.alterarStatus(req.params.id, req.body.status);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function remover(req, reply) {
  try {
    await service.remover(req.params.id);
    return reply.send({ success: true, message: 'Utilizador removido com sucesso' });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function listarEnderecos(req, reply) {
  try {
    const data = await service.listarEnderecos(req.params.id);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function atualizarEndereco(req, reply) {
  try {
    validarEndereco(req.body);
    const data = await service.atualizarEndereco(req.params.id, req.body);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function limparEndereco(req, reply) {
  try {
    await service.limparEndereco(req.params.id);
    return reply.send({ success: true, message: 'Endereço removido' });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function listarTelefones(req, reply) {
  try {
    const data = await service.listarTelefones(req.params.id);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function atualizarTelefone(req, reply) {
  try {
    validarTelefone(req.body);
    const data = await service.atualizarTelefone(req.params.id, req.body);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function limparTelefone(req, reply) {
  try {
    await service.limparTelefone(req.params.id);
    return reply.send({ success: true, message: 'Telefone removido' });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function buscarPorEmail(req, reply) {
  try {
    const { email } = req.query;
    if (!email) return reply.status(400).send({ success: false, error: 'Parâmetro email é obrigatório' });
    const usuario = await service.buscarPorEmail(email);
    if (!usuario) return reply.status(404).send({ success: false, message: 'Email não encontrado' });
    return reply.send({ success: true, data: usuario });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function listarInativos(req, reply) {
  try {
    const usuarios = await service.listarInativos();
    return reply.send({ success: true, data: usuarios });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function atualizarCargo(req, reply) {
  try {
    validarAtualizarCargo(req.body);
    const data = await service.atualizarCargo(req.params.id, req.body.tipo);
    return reply.send({ success: true, data });
  } catch (error) {
    return reply.status(400).send({ success: false, error: error.message });
  }
}

async function exportarDados(req, reply) {
  try {
    const data = await service.obterPorId(req.params.id);
    if (!data) return reply.status(404).send({ success: false, message: 'Utilizador não encontrado' });
    return reply.send({ success: true, export_date: new Date(), full_profile: data });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function obterLogs(req, reply) {
  try {
    const logs = await service.obterLogs(req.params.id);
    return reply.send({ success: true, data: logs, note: 'tabela de logs ainda não implementada' });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function uploadFoto(req, reply) {
  try {
    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ success: false, error: 'Nenhum arquivo enviado' });
    }

    const contentType = data.mimetype;
    const extensao = (() => {
      switch (contentType) {
        case 'image/jpeg':
        case 'image/jpg':
          return 'jpg';
        case 'image/png':
          return 'png';
        default:
          return null;
      }
    })();

    if (!extensao) {
      return reply.status(415).send({ success: false, error: 'Formato não suportado. Use JPG ou PNG.' });
    }

    const buffer = await data.toBuffer();
    await service.atualizarFoto(req.params.id, buffer, extensao, data.filename);

    return reply.status(201).send({ success: true, message: 'Foto atualizada com sucesso' });
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

async function exibirFoto(req, reply) {
  try {
    const usuario = await service.obterFoto(req.params.id);
    if (!usuario || !usuario.usuario_imagem || usuario.usuario_imagem.length === 0) {
      // Retorna uma imagem SVG padrão gerada dinamicamente para evitar erro 404 no Console do Frontend!
      const nome = usuario?.usuario_nome || '??';
      const iniciais = nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="100%" height="100%" fill="#94a3b8" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="80" font-family="sans-serif" font-weight="bold">${iniciais}</text>
      </svg>`;
      return reply
        .header('Content-Type', 'image/svg+xml')
        .header('Cache-Control', 'no-cache')
        .send(svg);
    }

    const extensao = (usuario.usuario_extensao || 'jpg').toLowerCase();
    let mediaType;
    switch (extensao) {
      case 'png':
        mediaType = 'image/png';
        break;
      default:
        mediaType = 'image/jpeg';
    }

    // decodifica o base64 (string com prefixo data:...) de volta pra bytes puros
    const base64Str = usuario.usuario_imagem.toString('utf-8');
    const base64SemPrefixo = base64Str.substring(base64Str.indexOf(',') + 1);
    const imagem = Buffer.from(base64SemPrefixo, 'base64');

    return reply
      .header('Content-Type', mediaType)
      .header('Cache-Control', 'no-cache')
      .header('Content-Disposition', `inline; filename="${usuario.usuario_imagem_nome || 'foto.jpg'}"`)
      .send(imagem);
  } catch (error) {
    return reply.status(500).send({ success: false, error: error.message });
  }
}

module.exports = {
  listar, obterPorId, criar, atualizar, alterarStatus, remover,
  listarEnderecos, atualizarEndereco, limparEndereco,
  listarTelefones, atualizarTelefone, limparTelefone,
  buscarPorEmail, listarInativos, atualizarCargo, exportarDados, obterLogs,
  uploadFoto, exibirFoto
};
