require('dotenv').config();
const { InfisicalSDK } = require('@infisical/sdk');
const buildApp = require('./app');
const { connect, close } = require('./config/rabbitmq');

const PORT = Number(process.env.PORT) || 9501;

async function start() {
  try {
    const siteUrl = process.env.NODE_ENV === 'production' 
      ? "http://host.docker.internal:8081" 
      : "http://localhost:8081";

    const client = new InfisicalSDK({ siteUrl });

    console.log(`[Infisical] Conectando em ${siteUrl}...`);

    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    });

    const response = await client.secrets().listSecrets({
      environment: "dev", 
      projectId: process.env.INFISICAL_PROJECT_ID
    });

    if (response && response.secrets) {
      response.secrets.forEach(s => {
        process.env[s.secretKey] = s.secretValue;
      });
      console.log('[Infisical] Segredos injetados!');
      
      // LINHA DE DEBUG PARA O PROFESSOR VER:
      console.log(`[DEBUG] A URL do RabbitMQ vinda do Infisical é: ${process.env.RABBITMQ_URL}`);
    }

    // Tenta conectar no RabbitMQ
    await connect().catch((err) => {
      console.error('[RabbitMQ] Erro de conexão:', err.message);
    });

    const fastify = buildApp();
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Server] Rodando na porta ${PORT}`);

  } catch (err) {
    console.error('[Server] Erro crítico:', err.message);
    process.exit(1);
  }
}

start();