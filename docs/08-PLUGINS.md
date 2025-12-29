# 🔌 Plugins - Configuração do Fastify

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que são Plugins?](#o-que-são-plugins)
2. [prisma.ts](#prismats)
3. [jwt.ts](#jwtts)
4. [cors.ts](#corsts)
5. [swagger.ts](#swaggerts)
6. [Ordem de Registro](#ordem-de-registro)
7. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que são Plugins?

**Plugins** são **extensões** que adicionam funcionalidades ao Fastify. Eles permitem:

- ✅ **Estender a aplicação:** Adicionar métodos, decoradores
- ✅ **Configurar bibliotecas:** Integrar Prisma, JWT, CORS, etc
- ✅ **Reutilizar código:** Criar funcionalidades modulares
- ✅ **Encapsular lógica:** Separar configurações da aplicação
- ✅ **Adicionar hooks:** Executar código em eventos do ciclo de vida

---

## 🏗️ Posição na Arquitetura

```
┌──────────────────────────────────────────────┐
│           src/app.ts (Aplicação)             │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ PLUGINS (Configuração)                 │ │
│  │                                        │ │
│  │  • Prisma    (Banco de dados)         │ │
│  │  • JWT       (Autenticação)           │ │
│  │  • CORS      (Requisições cross)      │ │
│  │  • Swagger   (Documentação)           │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ ROUTES (Endpoints)                     │ │
│  │  • /login, /users, /profile            │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 🗄️ prisma.ts

**Localização:** `src/plugins/prisma.ts`  
**Responsabilidade:** Configurar Prisma Client e disponibilizar para toda a aplicação

### 📝 Código Completo

```typescript
import fastifyPlugin from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function prismaPlugin(fastify: FastifyInstance) {
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async (app) => {
    await app.prisma.$disconnect();
  });
}

export default fastifyPlugin(prismaPlugin);
```

---

### 🔧 Linha por Linha

| Linha | Código                                       | Explicação                     |
| ----- | -------------------------------------------- | ------------------------------ |
| 1     | `import fastifyPlugin from "fastify-plugin"` | Wrapper para criar plugins     |
| 2     | `import { FastifyInstance }`                 | Tipo da aplicação Fastify      |
| 3     | `import { PrismaClient }`                    | Cliente do Prisma ORM          |
| 5     | `const prisma = new PrismaClient()`          | Cria instância única do Prisma |
| 8     | `fastify.decorate("prisma", prisma)`         | Adiciona `prisma` ao Fastify   |
| 10-12 | `fastify.addHook("onClose", ...)`            | Hook executado ao fechar app   |
| 11    | `await app.prisma.$disconnect()`             | Desconecta do banco de dados   |
| 15    | `export default fastifyPlugin(prismaPlugin)` | Exporta plugin                 |

---

### 🎯 O que faz `fastify.decorate()`?

**Adiciona uma propriedade** ao objeto `fastify`, disponível em toda a aplicação.

```typescript
// Antes:
fastify.prisma; // undefined

// Após decorate:
fastify.prisma; // PrismaClient { ... }

// Uso em controllers:
const users = await fastify.prisma.user.findMany();
```

---

### 🔌 O que faz `fastify.addHook()`?

**Registra função** para ser executada em eventos do ciclo de vida.

#### 🔄 Eventos Disponíveis

| Evento       | Quando executa?       |
| ------------ | --------------------- |
| `onRequest`  | Ao receber requisição |
| `preHandler` | Antes do handler      |
| `onResponse` | Ao enviar resposta    |
| `onClose`    | Ao fechar aplicação   |
| `onError`    | Ao ocorrer erro       |

```typescript
fastify.addHook("onClose", async (app) => {
  await app.prisma.$disconnect();
});
```

**Garante que a conexão com o banco seja fechada** quando a aplicação for desligada (CTRL+C, processo finalizado, etc).

---

### 🔗 Por que `fastifyPlugin()`?

```typescript
export default fastifyPlugin(prismaPlugin);
```

**Wrapper que garante** que o plugin seja registrado corretamente no contexto global.

#### ❌ Sem fastifyPlugin

```typescript
// Plugin registrado APENAS no contexto atual
export default prismaPlugin;
```

#### ✅ Com fastifyPlugin

```typescript
// Plugin registrado GLOBALMENTE
export default fastifyPlugin(prismaPlugin);
```

---

### 📊 Fluxo de Uso

```
1. app.ts registra plugin:
   await app.register(prismaPlugin)
   ↓
2. Plugin decora fastify:
   fastify.prisma = new PrismaClient()
   ↓
3. Controllers/Services usam:
   await fastify.prisma.user.findMany()
   ↓
4. Aplicação fecha (CTRL+C):
   Hook onClose é executado
   ↓
5. Desconecta do banco:
   await app.prisma.$disconnect()
```

---

## 🔐 jwt.ts

**Localização:** `src/plugins/jwt.ts`  
**Responsabilidade:** Configurar JWT e adicionar middleware de autenticação

### 📝 Código Completo

```typescript
import fastifyPlugin from "fastify-plugin";
import fastifyJwt from "fastify-jwt";
import { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/auth.middleware.js";

async function jwtPlugin(fastify: FastifyInstance) {
  const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  fastify.register(fastifyJwt, {
    secret: jwtSecret,
  });

  fastify.decorate("authenticate", authenticate);
}

export default fastifyPlugin(jwtPlugin);
```

---

### 🔧 Linha por Linha

| Linha | Código                                                | Explicação                         |
| ----- | ----------------------------------------------------- | ---------------------------------- |
| 2     | `import fastifyJwt from "fastify-jwt"`                | Plugin oficial do Fastify para JWT |
| 4     | `import { authenticate }`                             | Middleware de autenticação         |
| 7     | `const jwtSecret = process.env.JWT_SECRET \|\| "..."` | Chave secreta para assinar JWTs    |
| 9-11  | `fastify.register(fastifyJwt, { secret })`            | Registra plugin JWT                |
| 13    | `fastify.decorate("authenticate", authenticate)`      | Adiciona middleware ao Fastify     |

---

### 🔑 O que faz `fastify-jwt`?

**Adiciona métodos JWT** ao objeto `fastify`:

| Método                               | O que faz?                      |
| ------------------------------------ | ------------------------------- |
| `fastify.jwt.sign(payload, options)` | Gera JWT                        |
| `request.jwtVerify()`                | Verifica e decodifica JWT       |
| `request.jwtDecode()`                | Apenas decodifica (sem validar) |

---

### 🔒 JWT Secret

```typescript
const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
```

**Chave usada para assinar e verificar JWTs**.

#### ⚠️ Importante

```typescript
// ❌ NUNCA em produção:
secret: "your-secret-key";

// ✅ SEMPRE usar variável de ambiente:
secret: process.env.JWT_SECRET;
```

**Se alguém descobrir o secret, pode gerar tokens válidos!**

---

### 🎯 Como funciona JWT?

```
1. Login bem-sucedido:
   ↓
2. Gerar JWT:
   const token = fastify.jwt.sign({
     id: 1,
     email: "joao@email.com",
     type: "medico"
   }, { expiresIn: "1h" })
   ↓
3. Token gerado:
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2FvQGVtYWlsLmNvbSIsInR5cGUiOiJtZWRpY28ifQ.abcd1234..."
   ↓
4. Frontend envia em requisições:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
5. Middleware verifica:
   await request.jwtVerify()
   ↓
6. Token válido:
   request.user = { id: 1, email: "...", type: "medico" }
```

---

### 🔧 Uso do Plugin

```typescript
// Gerar token (controller):
const accessToken = request.server.jwt.sign(
  { id: 1, email: "...", type: "medico" },
  { expiresIn: "1h" }
);

// Verificar token (middleware):
await request.jwtVerify();
console.log(request.user); // { id: 1, email: "...", type: "medico" }
```

---

## 🌐 cors.ts

**Localização:** `src/plugins/cors.ts`  
**Responsabilidade:** Configurar CORS (Cross-Origin Resource Sharing)

### 📝 Código Completo

```typescript
import fastifyPlugin from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import { FastifyInstance } from "fastify";

async function corsPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyCors, {
    origin: true, // Em produção, configure origens específicas
    credentials: true,
  });
}

export default fastifyPlugin(corsPlugin);
```

---

### 🔧 Opções do CORS

| Opção         | Valor  | Significado                                      |
| ------------- | ------ | ------------------------------------------------ |
| `origin`      | `true` | Aceita requisições de qualquer origem            |
| `credentials` | `true` | Permite envio de cookies/headers de autenticação |

---

### 🌍 O que é CORS?

**CORS** permite que o **navegador** aceite requisições de **origens diferentes**.

#### 🚫 Sem CORS

```
Frontend:  http://localhost:5173  (React Native Web / Vite)
Backend:   http://localhost:3000

❌ Navegador bloqueia:
"Access to fetch at 'http://localhost:3000/login' from origin
'http://localhost:5173' has been blocked by CORS policy"
```

#### ✅ Com CORS

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3000  (CORS habilitado)

✅ Navegador permite:
fetch("http://localhost:3000/login") // Funciona!
```

---

### ⚙️ Configuração Recomendada

#### 🛠️ Desenvolvimento

```typescript
{
  origin: true,        // Aceita qualquer origem
  credentials: true
}
```

#### 🚀 Produção

```typescript
{
  origin: [
    "https://meuapp.com",
    "https://app.meuapp.com"
  ],
  credentials: true
}
```

**Nunca use `origin: true` em produção!** Especifique origens permitidas.

---

### 📦 Headers Adicionados

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## 📚 swagger.ts

**Localização:** `src/plugins/swagger.ts`  
**Responsabilidade:** Configurar documentação Swagger/OpenAPI

### 📝 Código Completo

```typescript
import fastifyPlugin from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifyScalar from "@scalar/fastify-api-reference";
import { FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

async function swaggerPlugin(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Health Diary Monitoring API",
        description:
          "API REST para gerenciamento e monitoramento de saúde diária para pacientes",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Servidor de desenvolvimento",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Token JWT obtido através do endpoint /login",
          },
        },
      },
      tags: [
        {
          name: "Autenticação",
          description: "Endpoints relacionados à autenticação de usuários",
        },
        {
          name: "Usuários",
          description: "Endpoints para gerenciamento de usuários",
        },
        {
          name: "Médicos",
          description: "Endpoints exclusivos para médicos",
        },
        {
          name: "Pacientes",
          description: "Endpoints exclusivos para pacientes",
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(fastifyScalar, {
    routePrefix: "/docs",
    configuration: {
      theme: "purple",
      hideDownloadButton: false,
    },
  });
}

export default fastifyPlugin(swaggerPlugin);
```

---

### 🔧 Componentes Principais

#### 1. **Validator e Serializer**

**Linha 12-13**

```typescript
fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);
```

- `validatorCompiler`: **Valida requisições** usando Zod
- `serializerCompiler`: **Serializa respostas** para JSON

**Integra Zod com Fastify automaticamente!**

---

#### 2. **OpenAPI Configuration**

**Linha 15-56**

```typescript
await fastify.register(fastifySwagger, {
  openapi: {
    info: { ... },
    servers: [ ... ],
    components: { ... },
    tags: [ ... ]
  }
});
```

| Seção                        | O que define?                    |
| ---------------------------- | -------------------------------- |
| `info`                       | Título, descrição, versão da API |
| `servers`                    | URLs dos servidores (dev, prod)  |
| `components.securitySchemes` | Tipos de autenticação            |
| `tags`                       | Categorias de endpoints          |

---

#### 3. **Security Schemes**

**Linha 30-37**

```typescript
securitySchemes: {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Token JWT obtido através do endpoint /login",
  },
}
```

**Define que a API usa autenticação Bearer Token (JWT)**.

Usado nas rotas:

```typescript
// Na rota:
schema: {
  security: [{ bearerAuth: [] }]; // ← Referencia bearerAuth
}
```

---

#### 4. **Tags**

**Linha 39-53**

```typescript
tags: [
  {
    name: "Autenticação",
    description: "Endpoints relacionados à autenticação de usuários",
  },
  // ...
];
```

**Organiza endpoints por categoria** no Swagger UI.

Usado nas rotas:

```typescript
schema: {
  tags: ["Autenticação"]; // ← Referencia tag
}
```

---

#### 5. **Scalar UI**

**Linha 58-64**

```typescript
await fastify.register(fastifyScalar, {
  routePrefix: "/docs",
  configuration: {
    theme: "purple",
    hideDownloadButton: false,
  },
});
```

**Interface visual** para visualizar e testar a API.

- **URL:** `http://localhost:3000/docs`
- **Tema:** Roxo
- **Recursos:** Testar endpoints, ver schemas, baixar especificação OpenAPI

---

### 📸 Estrutura do Swagger UI

```
┌──────────────────────────────────────────────┐
│ 📘 Health Diary Monitoring API v1.0.0        │
│                                              │
│ Servidor: http://localhost:3000              │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔐 Autenticação                          │ │
│ │   POST /login        Realizar login      │ │
│ │   POST /refresh      Renovar token       │ │
│ │   POST /logout       Fazer logout        │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 👤 Usuários                              │ │
│ │   POST /users        Criar usuário       │ │
│ │   GET /users         Listar usuários     │ │
│ │   GET /profile       Ver perfil       🔒 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ [🔓 Authorize] ← Inserir Bearer Token        │
└──────────────────────────────────────────────┘
```

---

## 🔢 Ordem de Registro

**A ordem de registro dos plugins importa!**

### ✅ Ordem Correta (app.ts)

```typescript
// 1. CORS (primeiro para aceitar requisições)
await app.register(corsPlugin);

// 2. Prisma (acesso ao banco)
await app.register(prismaPlugin);

// 3. JWT (autenticação)
await app.register(jwtPlugin);

// 4. Swagger (documentação)
await app.register(swaggerPlugin);

// 5. Rotas (por último)
await app.register(authRoutes);
await app.register(userRoutes);
```

---

### 📊 Por que essa ordem?

```
1. CORS:
   ✅ Permite requisições de outras origens

2. Prisma:
   ✅ Disponibiliza acesso ao banco
   ✅ Rotas precisam de Prisma

3. JWT:
   ✅ Disponibiliza fastify.jwt.sign()
   ✅ Disponibiliza app.authenticate
   ✅ Rotas protegidas precisam de JWT

4. Swagger:
   ✅ Coleta informações das rotas
   ✅ Precisa estar antes das rotas

5. Rotas:
   ✅ Por último (dependem de todos os plugins)
```

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados

#### 1. **Sempre usar fastifyPlugin()**

```typescript
export default fastifyPlugin(prismaPlugin);
```

**Garante registro global do plugin**.

---

#### 2. **Adicionar cleanup em hooks**

```typescript
fastify.addHook("onClose", async (app) => {
  await app.prisma.$disconnect();
});
```

**Limpa recursos ao fechar aplicação**.

---

#### 3. **Usar variáveis de ambiente**

```typescript
// ❌ NUNCA:
const jwtSecret = "my-secret-key";

// ✅ SEMPRE:
const jwtSecret = process.env.JWT_SECRET || "fallback-dev-only";
```

---

#### 4. **Configurar CORS corretamente**

```typescript
// 🛠️ Desenvolvimento:
{ origin: true, credentials: true }

// 🚀 Produção:
{ origin: ["https://meuapp.com"], credentials: true }
```

---

#### 5. **Documentar API com Swagger**

```typescript
tags: [
  {
    name: "Categoria",
    description: "Descrição detalhada",
  },
];
```

---

## 📖 Resumo

### 🔌 Plugins Principais

| Plugin         | Responsabilidade         | Métodos Adicionados                                                 |
| -------------- | ------------------------ | ------------------------------------------------------------------- |
| **prisma.ts**  | Banco de dados           | `fastify.prisma`                                                    |
| **jwt.ts**     | Autenticação JWT         | `fastify.jwt.sign()`, `request.jwtVerify()`, `fastify.authenticate` |
| **cors.ts**    | Requisições cross-origin | Headers CORS                                                        |
| **swagger.ts** | Documentação API         | `/docs` endpoint                                                    |

---

### 🔗 Decorators Adicionados

```typescript
// prisma.ts:
fastify.prisma; // PrismaClient

// jwt.ts:
fastify.jwt.sign(payload, options); // Gerar JWT
request.jwtVerify(); // Verificar JWT
fastify.authenticate; // Middleware
```

---

### 📦 Ciclo de Vida

```
1. Aplicação inicia:
   ↓
2. Registra plugins:
   - CORS
   - Prisma
   - JWT
   - Swagger
   ↓
3. Registra rotas
   ↓
4. Aplicação fica ativa
   ↓
5. Aplicação fecha (CTRL+C):
   - Hook onClose executa
   - Prisma desconecta
```

---

## 🔧 Testes

### Teste: Verificar Prisma

```typescript
// Em qualquer controller/service:
const users = await fastify.prisma.user.findMany();
console.log(users); // Array de usuários
```

---

### Teste: Verificar JWT

```typescript
// Gerar token:
const token = fastify.jwt.sign({ id: 1, email: "..." });
console.log(token); // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Verificar token:
const decoded = fastify.jwt.verify(token);
console.log(decoded); // { id: 1, email: "..." }
```

---

### Teste: Verificar CORS

```bash
# Request de origem diferente:
curl -X POST http://localhost:3000/login \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{ "email": "...", "password": "..." }'

# Response deve incluir:
# Access-Control-Allow-Origin: http://localhost:5173
```

---

### Teste: Verificar Swagger

```bash
# Acessar documentação:
open http://localhost:3000/docs

# Ou com curl:
curl http://localhost:3000/docs
```

---

## 📖 Documentos Relacionados

- **[01-TECNOLOGIAS.md](01-TECNOLOGIAS.md)** - Tecnologias detalhadas
- **[03-SERVICES.md](03-SERVICES.md)** - Lógica de negócio
- **[04-CONTROLLERS.md](04-CONTROLLERS.md)** - Processamento de requisições
- **[05-ROUTES.md](05-ROUTES.md)** - Definição de endpoints
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Validação com Zod
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização

---

**[⬅️ Voltar para Middlewares](07-MIDDLEWARES.md)** | **[🏠 Voltar para Overview](00-OVERVIEW.md)**
