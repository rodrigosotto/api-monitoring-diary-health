# 🛠️ Tecnologias Utilizadas

## 1. Prisma ORM

### O que é?

Prisma é um ORM (Object-Relational Mapping) moderno para TypeScript e Node.js que facilita o trabalho com bancos de dados relacionais.

### Por que usar?

- ✅ Type-safe: Tipagem automática baseada no schema
- ✅ Auto-complete: IntelliSense completo no VS Code
- ✅ Migrations: Controle de versão do banco de dados
- ✅ Prisma Studio: Interface visual para gerenciar dados

### Como funciona?

#### 1. Schema Definition

```prisma
// prisma/schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
}
```

#### 2. Gerar Client

```bash
npm run generate  # Gera o Prisma Client com tipos TypeScript
```

#### 3. Usar no Código

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Type-safe: TypeScript sabe que 'email' e 'name' existem
const user = await prisma.user.create({
  data: { email: "test@test.com", name: "Test" },
});
```

### Comandos Principais

```bash
# Gerar Prisma Client (após alterar schema.prisma)
npx prisma generate
npm run generate

# Criar migration (altera o banco de dados)
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations pendentes
npx prisma migrate deploy

# Sincronizar schema com banco (dev only)
npx prisma db push

# Abrir interface visual do banco
npx prisma studio

# Verificar status das migrations
npx prisma migrate status

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset
```

### Onde é usado no projeto?

- `prisma/schema.prisma` - Definição dos models
- `src/services/*.service.ts` - Acesso ao banco via Prisma Client
- `src/plugins/prisma.ts` - Plugin que injeta Prisma no Fastify

---

## 2. Zod

### O que é?

Zod é uma biblioteca de validação de schemas TypeScript-first. Ela valida dados em runtime e gera tipos TypeScript automaticamente.

### Por que usar?

- ✅ Validação robusta com mensagens de erro claras
- ✅ Inferência automática de tipos TypeScript
- ✅ Transformações de dados (parse, coerce)
- ✅ Composição de schemas

### Como funciona?

```typescript
import { z } from "zod";

// 1. Definir schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().positive(),
});

// 2. Inferir tipo TypeScript
type User = z.infer<typeof userSchema>;
// type User = { email: string; password: string; age: number }

// 3. Validar dados
const result = userSchema.safeParse({
  email: "test@test.com",
  password: "123456",
  age: 25,
});

if (result.success) {
  console.log(result.data); // Dados validados
} else {
  console.log(result.error.issues); // Erros de validação
}
```

### Onde é usado no projeto?

- `src/schemas/auth.schema.ts` - Validação de login e refresh token
- `src/schemas/user.schema.ts` - Validação de criação de usuário
- `src/schemas/pagination.schema.ts` - Validação de paginação
- `src/routes/*.routes.ts` - Integrado com Fastify para validar requests

### Exemplo Real do Projeto

```typescript
// src/schemas/auth.schema.ts
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

// src/routes/auth.routes.ts
app.route({
  method: "POST",
  url: "/login",
  schema: {
    body: loginSchema, // Fastify valida automaticamente
  },
});
```

---

## 3. Docker

### O que é?

Docker é uma plataforma para criar, executar e distribuir aplicações em containers isolados.

### Por que usar?

- ✅ Ambiente consistente (funciona igual em dev, staging, prod)
- ✅ Isolamento de dependências
- ✅ Fácil deploy e escalabilidade
- ✅ Inclui PostgreSQL pré-configurado

### Como funciona?

#### Dockerfile

Define como construir a imagem da aplicação:

```dockerfile
FROM node:18-alpine      # Imagem base
WORKDIR /app             # Diretório de trabalho
COPY package*.json ./    # Copiar arquivos
RUN npm install          # Instalar dependências
COPY . .                 # Copiar código
EXPOSE 3000              # Expor porta
CMD ["npm", "start"]     # Comando para iniciar
```

#### Docker Compose

Orquestra múltiplos containers (API + PostgreSQL):

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: dbname
```

### Comandos Principais

```bash
# Subir todos os containers
docker-compose up -d

# Subir apenas o PostgreSQL
docker-compose up -d postgres

# Parar todos os containers
docker-compose down

# Ver logs
docker-compose logs -f api

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d

# Remover volumes (apaga dados do banco)
docker-compose down -v

# Acessar shell do container
docker exec -it health-diary-monitoring-api sh
docker exec -it postgres-db psql -U jefferson -d monitordiaryhealthdb
```

### Onde é usado no projeto?

- `Dockerfile` - Construção da imagem da API
- `docker-compose.yml` - Orquestração de API + PostgreSQL
- `.dockerignore` - Arquivos ignorados no build

---

## 4. Fastify

### O que é?

Fastify é um framework web de alta performance para Node.js, focado em velocidade e baixo overhead.

### Por que usar?

- ✅ 2x mais rápido que Express
- ✅ Sistema de plugins robusto
- ✅ Validação de schemas nativa
- ✅ Type-safe com TypeScript
- ✅ Suporte a async/await

### Como funciona?

```typescript
import Fastify from "fastify";

const app = Fastify({ logger: true });

// Rota simples
app.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Iniciar servidor
await app.listen({ port: 3000 });
```

### Onde é usado no projeto?

- `src/app.ts` - Configuração principal
- `src/server.ts` - Inicialização do servidor
- `src/routes/*.routes.ts` - Definição de rotas
- `src/plugins/*.ts` - Plugins customizados

---

## 5. JWT (JSON Web Tokens)

### O que é?

JWT é um padrão para criar tokens de acesso seguros que contêm informações do usuário.

### Por que usar?

- ✅ Stateless: Não precisa armazenar sessão no servidor
- ✅ Descentralizado: Token contém todas as informações
- ✅ Seguro: Assinado criptograficamente
- ✅ Ideal para APIs REST e aplicações mobile

### Como funciona?

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.     <- Header (algoritmo)
eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0. <- Payload (dados)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c     <- Signature (assinatura)
```

### Estrutura

1. **Header**: Tipo do token e algoritmo
2. **Payload**: Dados do usuário (id, email, role)
3. **Signature**: Assinatura para verificar autenticidade

### Onde é usado no projeto?

- `src/plugins/jwt.ts` - Configuração do JWT
- `src/controllers/auth.controller.ts` - Geração de tokens
- `src/middlewares/auth.middleware.ts` - Verificação de tokens

### Exemplo Real

```typescript
// Gerar token
const token = fastify.jwt.sign(
  { id: 1, email: "user@test.com", type: "medico" },
  { expiresIn: "1h" }
);

// Verificar token
await request.jwtVerify();
const user = request.user; // { id: 1, email: '...', type: 'medico' }
```

---

## 6. Bcrypt

### O que é?

Bcrypt é uma função de hash criptográfica usada para armazenar senhas com segurança.

### Por que usar?

- ✅ Resistente a ataques de força bruta (slow by design)
- ✅ Salt automático (previne rainbow tables)
- ✅ Algoritmo testado e confiável

### Como funciona?

```typescript
import bcrypt from "bcryptjs";

// Criar hash da senha
const hash = await bcrypt.hash("senha123", 10);
// $2a$10$KmGJK8yVZ8hQ2... (hash + salt)

// Verificar senha
const isValid = await bcrypt.compare("senha123", hash);
// true ou false
```

### Onde é usado no projeto?

- `src/services/user.service.ts` - Hash ao criar usuário
- `src/services/auth.service.ts` - Comparação no login

---

## 7. TypeScript

### O que é?

TypeScript é um superset do JavaScript que adiciona tipagem estática.

### Por que usar?

- ✅ Previne erros em tempo de desenvolvimento
- ✅ Auto-complete e IntelliSense
- ✅ Refatoração mais segura
- ✅ Documentação implícita via tipos

### Configuração

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020", // Versão do JS gerado
    "module": "ESNext", // Sistema de módulos
    "strict": true, // Modo strict (recomendado)
    "outDir": "dist", // Pasta de saída
    "rootDir": "src" // Pasta de entrada
  }
}
```

### Comandos

```bash
# Compilar TypeScript → JavaScript
npm run build

# Watch mode (recompila automaticamente)
npm run dev
```
