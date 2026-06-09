const fastify = require('fastify')({ logger: true });
require('dotenv').config();

const { loadSecrets } = require('./config/infisical');

// Configura a porta correta do microsserviço (9501) vinda do ambiente ou fallback
const PORT = Number(process.env.PORT) || 9501;

const start = async () => {
    try {
        // 1. Carrega os secrets do Infisical PRIMEIRO (idêntico ao catálogo)
        await loadSecrets();

        // 2. Importa e configura as dependências após o carregamento do cofre
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_biblioteca_2026';
        
        const { connect, close } = require('./config/rabbitmq');
        fastify.register(require('./plugins/prisma'));

        fastify.register(require('@fastify/cors'), {
            origin: true, 
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        });

        // Hook de autenticação global extraído do app.js
        fastify.addHook('onRequest', async (req) => {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try { 
                    req.usuario = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET); 
                } catch {}
            }
        });

        // Rota de Health integrada
        fastify.get('/health', async () => {
            return { status: 'ok', servico: 'usuarios' };
        });

        // Registro das rotas específicas do micro de usuário
        fastify.register(require('./routes/usuarios'), { prefix: '/usuarios' });
        fastify.register(require('./routes/auth'), { prefix: '/auth' });

        // Conexão com o broker do RabbitMQ
        await connect();

        // 3. Sobe o servidor HTTP na porta dinâmica corrigida
        await fastify.listen({ port: PORT, host: '0.0.0.0' });

        console.log(`[Server] Microsserviço de Usuários rodando perfeitamente na porta ${PORT}`);
        
        // 4. Graceful shutdown para encerrar os processos de forma limpa
        const shutdown = async (signal) => {
            console.log(`[Server] ${signal} recebido. Encerrando...`);
            await fastify.close();
            await close();
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT',  () => shutdown('SIGINT'));

    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();