require('dotenv').config();
const buildApp = require('./app');
const { connect, close } = require('./config/rabbitmq');

const PORT = Number(process.env.PORT) || 9501;

async function start() {
  // Inicia conexão com RabbitMQ
  connect().catch((err) => {
    console.error('[RabbitMQ] Erro inicial:', err.message);
  });

  const fastify = buildApp();

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Server] Microsserviço de Usuários rodando na porta ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`[Server] ${signal} recebido. Encerrando...`);
    await fastify.close();
    await close(); 
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start();