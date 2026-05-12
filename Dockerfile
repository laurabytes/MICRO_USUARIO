# Estágio de construção
FROM node:20-slim

# Instalar dependências necessárias para o Prisma e MySQL
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copiar arquivos de dependências e o schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Gerar o cliente do Prisma
RUN npx prisma generate

# Expor a porta definida no seu server.js
EXPOSE 9501

CMD ["npm", "start"]