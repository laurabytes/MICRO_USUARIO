require('dotenv').config();
const { InfisicalSDK } = require('@infisical/sdk');

async function start() {
  try {
    // 1. Configura o SDK apontando para o IP local (estabilidade no Windows)
    const client = new InfisicalSDK({ 
      siteUrl: "http://127.0.0.1:8081" 
    });

    console.log('[Infisical] Autenticando...');

    await client.auth().universalAuth.login({
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    });

    // 2. Busca segredos
    const response = await client.secrets().listSecrets({
      environment: "dev", 
      projectId: process.env.INFISICAL_PROJECT_ID
    });

    // 3. Injeta no process.env antes de carregar o RabbitMQ
    if (response && response.secrets) {
      response.secrets.forEach(s => {
        process.env[s.secretKey] = s.secretValue;
      });
      console.log('[Infisical] Segredos injetados no process.env com sucesso!');
    }

    // 4. IMPORTAÇÃO DINÂMICA: O RabbitMQ só é carregado após os segredos estarem prontos
    const { connect } = require('./config/rabbitmq');
    await connect();

    // 5. Inicia o Fastify
    const buildApp = require('./app');
    const app = await buildApp();
    
    // EXIBE AS ROTAS ATIVAS NO TERMINAL (Útil para debugar o 404)
    console.log('--- Rotas Registradas ---');
    console.log(app.printRoutes());
    console.log('-------------------------');

    const port = process.env.PORT || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[Server] Microserviço a correr em: http://localhost:${port}`);

  } catch (err) {
    console.error('[Fatal] Erro ao iniciar:', err.message);
    process.exit(1);
  }
}

start();