# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./

# Copy source, generate prisma client and build
COPY . .
RUN npm run generate && npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

# Copy package files and production node_modules from builder
COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy build output and prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start"]