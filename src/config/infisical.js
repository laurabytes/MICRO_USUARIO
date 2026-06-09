/**
 * src/config/infisical.js
 * SDK @infisical/sdk v5 — autenticação via Universal Auth (Machine Identity)
 */

const { InfisicalSDK } = require('@infisical/sdk');

// Usando os seus IDs como fallback caso não venham do .env no servidor
const CLIENT_ID            = process.env.CLIENT_ID            || '3dcf22f2-e6a1-40c3-b3ec-2d553fd42620';
const CLIENT_SECRET        = process.env.CLIENT_SECRET        || 'ccab5e06840ed91b218513a3e5cf450999ff52e0d1e98719edd199853b3f48a8';
const INFISICAL_PROJECT_ID = process.env.INFISICAL_PROJECT_ID || '6c550174-d6d5-4d43-a092-b077a62467dd';
const INFISICAL_ENV        = process.env.INFISICAL_ENV        || 'dev'; // Mude para 'production' ou o slug do ambiente correto se necessário

async function loadSecrets() {
  

  if (!CLIENT_ID || !CLIENT_SECRET || !INFISICAL_PROJECT_ID) {
    console.error('[Infisical] ❌ Credenciais incompletas. Faltam chaves do Infisical.');
    process.exit(1);
  }

  try {
    console.log(`[Infisical] Conectando... projeto: ${INFISICAL_PROJECT_ID} | ambiente: ${INFISICAL_ENV}`);

    const client = new InfisicalSDK({ siteUrl: 'https://app.infisical.com' });

    // Autenticação com Universal Auth usando Client ID e Client Secret
    await client.auth().universalAuth.login({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });

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