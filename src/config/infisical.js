/**
 * src/config/infisical.js
 * SDK @infisical/sdk v5 — suporta Universal Auth ou Service Token (AccessToken)
 */
const { InfisicalSDK } = require('@infisical/sdk');
const CLIENT_ID            = process.env.CLIENT_ID            || '3dcf22f2-e6a1-40c3-b3ec-2d553fd42620';
const CLIENT_SECRET        = process.env.CLIENT_SECRET        || 'ccab5e06840ed91b218513a3e5cf450999ff52e0d1e98719edd199853b3f48a8';
const INFISICAL_TOKEN      = process.env.INFISICAL_TOKEN;
const INFISICAL_PROJECT_ID = process.env.INFISICAL_PROJECT_ID || '6c550174-d6d5-4d43-a092-b077a62467dd';
const INFISICAL_ENV        = process.env.INFISICAL_ENV        || 'dev';

async function loadSecrets() {
  // Verifica se temos pelo menos uma forma válida de autenticação
  const temServiceToken = !!INFISICAL_TOKEN;
  const temUniversalAuth = !!(CLIENT_ID && CLIENT_SECRET);

  if (!temServiceToken && !temUniversalAuth) {
    console.log('[Infisical] Credenciais ausentes — usando variáveis locais (.env).');
    return;
  }

  if (!INFISICAL_PROJECT_ID) {
    console.error('[Infisical] ❌ INFISICAL_PROJECT_ID não definido.');
    process.exit(1);
  }

  try {
    console.log(`[Infisical] Conectando... projeto: ${INFISICAL_PROJECT_ID} | ambiente: ${INFISICAL_ENV}`);
    const client = new InfisicalSDK({ siteUrl: 'https://app.infisical.com' });

    if (temServiceToken) {
      console.log('[Infisical] Autenticando com Service Token...');
      await client.auth().accessToken(INFISICAL_TOKEN);
    } else {
      console.log('[Infisical] Autenticando com Universal Auth...');
      await client.auth().universalAuth.login({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      });
    }

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
