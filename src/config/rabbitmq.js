const amqplib = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:adminadmin@academico3.rj.senac.br:5672';
const EXCHANGE = 'biblioteca';
const EXCHANGE_TYPE = 'topic';

let connection = null;
let channel = null;

async function connect() {
  try {
    connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, EXCHANGE_TYPE, { durable: true });
    console.log('[RabbitMQ] Conectado com sucesso');
  } catch (err) {
    console.error('[RabbitMQ] Erro ao conectar:', err.message);
    setTimeout(connect, 5000);
  }
}

async function publish(routingKey, payload) {
  if (!channel) return false;
  const buffer = Buffer.from(JSON.stringify(payload));
  return channel.publish(EXCHANGE, routingKey, buffer, {
    persistent: true,
    contentType: 'application/json'
  });
}

const EVENTS = {
  USUARIO_CRIADO: 'biblioteca.usuario.criado',
  USUARIO_STATUS_ALTERADO: 'biblioteca.usuario.status_alterado',
};

module.exports = { connect, publish, EVENTS };