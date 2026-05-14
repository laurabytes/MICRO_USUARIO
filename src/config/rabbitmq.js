const amqplib = require('amqplib');

let connection;
let channel;

async function connect() {
  // A URL é lida de dentro da função para garantir que pega o valor do Infisical
  const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:adminadmin@127.0.0.1:5672';
  
  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('[RabbitMQ] Ligado com sucesso à URL:', RABBITMQ_URL.split('@')[1]);
    
    connection.on('error', (err) => {
      console.error('[RabbitMQ] Erro na ligação:', err.message);
      setTimeout(connect, 5000);
    });

    connection.on('close', () => {
      console.warn('[RabbitMQ] Ligação fechada. Tentando reconectar...');
      setTimeout(connect, 5000);
    });

  } catch (err) {
    console.error('[RabbitMQ] Erro ao conectar:', err.message);
    setTimeout(connect, 5000);
  }
}

const getChannel = () => channel;

module.exports = { connect, getChannel };