/**
 * src/config/infisical.js
 * SDK @infisical/sdk v5 — autenticação via accessToken (Service Token)
 *
 * Padrão idêntico ao microsserviço de Empréstimos.
 * Em desenvolvimento (NODE_ENV !== 'production') usa .env local.
 * Em produção, carrega os secrets do vault e injeta em process.env.
 */

const { InfisicalSDK } = require('@infisical/sdk');

const INFISICAL_TOKEN      = process.env.INFISICAL_TOKEN      || 'st.77c4fb00-59ad-4761-8fca-0ca2986a996f.be07fb442b0b9714120d9b53cd2fb6d6.37e739d0e26104262a26000d4a8d3f47';
const INFISICAL_PROJECT_ID = process.env.INFISICAL_PROJECT_ID || '4be3bccd-8b94-4540-9611-d88cbef6950b';
const INFISICAL_ENV        = process.env.INFISICAL_ENV        || 'prod';

async function loadSecrets() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Infisical] NODE_ENV !== production — usando variáveis locais (.env)');
    return;
  }

  if (!INFISICAL_TOKEN || !INFISICAL_PROJECT_ID) {
    console.error('[Infisical] ❌ INFISICAL_TOKEN ou INFISICAL_PROJECT_ID não definidos.');
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
