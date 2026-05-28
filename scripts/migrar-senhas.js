/**
 * scripts/migrar-senhas.js
 *
 * Executa UMA VEZ para fazer hash de todas as senhas que ainda estão
 * em texto plano no banco de dados.
 *
 * Uso:
 *   node scripts/migrar-senhas.js
 *
 * Como detectar se a senha já é um hash bcrypt:
 *   Hashes bcrypt sempre começam com "$2b$" ou "$2a$"
 */
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function migrarSenhas() {
  console.log('[Migração] Iniciando migração de senhas para bcrypt...');

  const usuarios = await prisma.usuario.findMany({
    select: { usuario_id: true, usuario_email: true, usuario_senha: true },
  });

  let migrados = 0;
  let jaEstavamHash = 0;

  for (const usuario of usuarios) {
    const ehHash = usuario.usuario_senha.startsWith('$2b$') || usuario.usuario_senha.startsWith('$2a$');

    if (ehHash) {
      jaEstavamHash++;
      continue;
    }

    const novoHash = await bcrypt.hash(usuario.usuario_senha, 12);
    await prisma.usuario.update({
      where: { usuario_id: usuario.usuario_id },
      data: { usuario_senha: novoHash },
    });

    console.log(`  [ok] Migrado: ${usuario.usuario_email}`);
    migrados++;
  }

  console.log(`\n[Migração] Concluída!`);
  console.log(`  --> ${migrados} senha(s) migrada(s) para hash`);
  console.log(`  --> ${jaEstavamHash} já estavam com hash bcrypt`);

  await prisma.$disconnect();
}

migrarSenhas().catch((err) => {
  console.error('[Migração] Erro:', err);
  process.exit(1);
});
