/**
 * src/config/infisical.js
 * SDK @infisical/sdk v5 — autenticação via accessToken (Service Token)
 *
 * Padrão idêntico ao microsserviço de Empréstimos.
 * Em desenvolvimento (NODE_ENV !== 'production') usa .env local.
 * Em produção, carrega os secrets do vault e injeta em process.env.
 */

const { InfisicalSDK } = require('@infisical/sdk');

const CLIENT_ID      = process.env.CLIENT_ID      || '0f21ce6e-4709-4498-a418-f1736aa85317';
const INFISICAL_PROJECT_ID = process.env.INFISICAL_PROJECT_ID || 'cb64198c-9fdb-4106-94a3-824e4ba6e6d4';
const INFISICAL_ENV        = process.env.INFISICAL_ENV        || 'e25f7837a52bfd56fe3453ba2f60d5525937a62a301a056ce178cf9adb9e8923';

async function loadSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Infisical] NODE_ENV !== production — usando variáveis locais (.env)');
    return;
  }

  if (!CLIENT_ID || !INFISICAL_PROJECT_ID) {
    console.error('[Infisical] ❌ CLIENT_ID ou INFISICAL_PROJECT_ID não definidos.');
    process.exit(1);
  }

  try {
    console.log(`[Infisical] Conectando... projeto: ${INFISICAL_PROJECT_ID} | ambiente: ${INFISICAL_ENV}`);

    const client = new InfisicalSDK({ siteUrl: 'https://app.infisical.com' });

    // SDK v5: Service Token usa accessToken() diretamente
    await client.auth().accessToken(INFISICAL_TOKEN);

    const { secrets } = await client.secrets().listSecrets({
      projectId:   INFISICAL_PROJECT_ID,
      environment: INFISICAL_ENV,
      secretPath:  '/',
    });

    let count = 0;
    for (const secret of secrets) {
      if (!process.env[secret.secretKey]) {
        process.env[secret.secretKey] = secret.secretValue;
        count++;
      }
    }

    console.log(`[Infisical] ✅ ${count} secret(s) carregado(s).`);
  } catch (err) {
    console.error('[Infisical] ❌ Erro ao carregar secrets:', err.message);
    process.exit(1);
  }
}

module.exports = { loadSecrets };
