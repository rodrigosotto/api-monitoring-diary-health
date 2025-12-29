# 🛣️ Routes - Definição de Endpoints e Swagger

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que são Routes?](#o-que-são-routes)
2. [auth.routes.ts](#authroutests)
3. [user.routes.ts](#userroutests)
4. [Swagger Documentation](#swagger-documentation)
5. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que são Routes?

**Routes** definem os **endpoints HTTP** da API. Eles especificam:

- ✅ URL do endpoint (`/login`, `/users`, etc)
- ✅ Método HTTP (GET, POST, PUT, DELETE)
- ✅ Schema de validação (Zod)
- ✅ Documentação Swagger/OpenAPI
- ✅ Middlewares (autenticação, autorização)
- ✅ Handler (função do controller que processa a requisição)

### 🏗️ Posição na Arquitetura

```
┌──────────────────┐
│   Frontend/App   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     ROUTES       │  ← Define endpoints e validação (ESTA CAMADA)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Controllers    │  ← Processa request/response
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Services      │  ← Lógica de negócio
└──────────────────┘
```

---

## 🔐 auth.routes.ts

**Localização:** `src/routes/auth.routes.ts`  
**Responsabilidade:** Endpoints de autenticação

### 📝 Estrutura do Arquivo

```typescript
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AuthController } from "../controllers/auth.controller.js";
import { loginSchema, refreshTokenSchema } from "../schemas/auth.schema.js";

const authController = new AuthController();

export async function authRoutes(app: FastifyInstance) {
  // ... rotas
}
```

#### 📦 Imports Explicados

| Import               | Para que serve?                   |
| -------------------- | --------------------------------- |
| `FastifyInstance`    | Tipo da aplicação Fastify         |
| `ZodTypeProvider`    | Integração Fastify + Zod          |
| `z`                  | Criar schemas de validação inline |
| `AuthController`     | Handlers das rotas                |
| `loginSchema`        | Schema de validação do login      |
| `refreshTokenSchema` | Schema de validação do refresh    |

---

### 🔑 Rota: POST /login

**Linha 11-47**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/login",
  schema: {
    tags: ["Autenticação"],
    summary: "Realizar login na aplicação",
    description:
      "Autentica um usuário com email e senha, retornando um access token (1h) e refresh token (90 dias)",
    body: loginSchema,
    response: {
      200: z
        .object({
          message: z.string(),
          accessToken: z.string(),
          refreshToken: z.string(),
          expiresIn: z.number(),
          user: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            type: z.string(),
            createdAt: z.string().or(z.date()),
          }),
        })
        .describe("Login realizado com sucesso"),
      401: z
        .object({
          message: z.string(),
        })
        .describe("Credenciais inválidas"),
    },
  },
  handler: authController.login.bind(authController),
});
```

#### 🔧 Propriedades da Rota

| Propriedade   | Valor                     | Explicação                |
| ------------- | ------------------------- | ------------------------- |
| `method`      | `"POST"`                  | Método HTTP da rota       |
| `url`         | `"/login"`                | Caminho do endpoint       |
| `tags`        | `["Autenticação"]`        | Categoria no Swagger      |
| `summary`     | "Realizar login..."       | Título no Swagger         |
| `description` | "Autentica um usuário..." | Descrição detalhada       |
| `body`        | `loginSchema`             | Validação do request.body |
| `response`    | `{ 200: ..., 401: ... }`  | Schemas das respostas     |
| `handler`     | `authController.login`    | Função que processa       |

#### 📊 Schema de Request (body)

```typescript
body: loginSchema;

// Definido em schemas/auth.schema.ts:
// {
//   email: string (email válido)
//   password: string (min 6 caracteres)
// }
```

**Exemplo de Request:**

```json
POST /login
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### 📦 Schema de Response (200)

```typescript
response: {
  200: z.object({
    message: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      type: z.string(),
      createdAt: z.string().or(z.date()),
    }),
  })
}
```

**Exemplo de Response:**

```json
{
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a3f7b2c1d4e5f6g7h8i9j0k1l2m3n4o5...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "medico",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### ❌ Schema de Response (401)

```typescript
401: z.object({
  message: z.string(),
}).describe("Credenciais inválidas")
```

**Exemplo de Response:**

```json
{
  "message": "Credenciais inválidas"
}
```

---

### 🔄 Rota: POST /refresh

**Linha 49-75**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/refresh",
  schema: {
    tags: ["Autenticação"],
    summary: "Renovar access token",
    description:
      "Gera um novo access token usando um refresh token válido. Use quando o access token expirar.",
    body: refreshTokenSchema,
    response: {
      200: z
        .object({
          message: z.string(),
          accessToken: z.string(),
          expiresIn: z.number(),
        })
        .describe("Token renovado com sucesso"),
      401: z
        .object({
          message: z.string(),
        })
        .describe("Refresh token inválido ou expirado"),
    },
  },
  handler: authController.refresh.bind(authController),
});
```

#### 📊 Request/Response

**Request:**

```json
POST /refresh
{
  "refreshToken": "a3f7b2c1d4e5f6g7h8i9j0k1l2m3n4o5..."
}
```

**Response (200):**

```json
{
  "message": "Token renovado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

### 🚪 Rota: POST /logout

**Linha 77-103**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/logout",
  schema: {
    tags: ["Autenticação"],
    summary: "Fazer logout",
    description:
      "Revoga o refresh token fornecido, invalidando-o para uso futuro",
    body: refreshTokenSchema,
    response: {
      200: z
        .object({
          message: z.string(),
        })
        .describe("Logout realizado com sucesso"),
      400: z
        .object({
          message: z.string(),
        })
        .describe("Erro ao fazer logout"),
    },
  },
  handler: authController.logout.bind(authController),
});
```

---

### 🌍 Rota: POST /logout-all

**Linha 105-131**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/logout-all",
  onRequest: [app.authenticate], // ← MIDDLEWARE DE AUTENTICAÇÃO
  schema: {
    tags: ["Autenticação"],
    summary: "Fazer logout de todos os dispositivos",
    description:
      "Revoga todos os refresh tokens do usuário autenticado, fazendo logout de todos os dispositivos",
    security: [{ bearerAuth: [] }], // ← DOCUMENTAÇÃO SWAGGER
    response: {
      200: z
        .object({
          message: z.string(),
        })
        .describe("Logout realizado em todos os dispositivos"),
      401: z
        .object({
          message: z.string(),
        })
        .describe("Não autorizado"),
    },
  },
  handler: authController.logoutAll.bind(authController),
});
```

#### 🔒 Rota Protegida

```typescript
onRequest: [app.authenticate];
```

- **Executa middleware ANTES do handler**
- Valida JWT no header `Authorization: Bearer <token>`
- Se token inválido, retorna **401** sem chamar o handler

#### 📚 Documentação de Segurança

```typescript
security: [{ bearerAuth: [] }];
```

- Indica no Swagger que a rota requer autenticação
- Mostra campo "Authorize" no Swagger UI
- `bearerAuth` definido em [swagger.ts](../src/plugins/swagger.ts)

---

## 👤 user.routes.ts

**Localização:** `src/routes/user.routes.ts`  
**Responsabilidade:** Endpoints de gerenciamento de usuários

### ➕ Rota: POST /users

**Linha 12-40**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/users",
  schema: {
    tags: ["Usuários"],
    summary: "Criar novo usuário",
    description: "Registra um novo usuário no sistema (médico ou paciente)",
    body: createUserSchema,
    response: {
      201: z
        .object({
          message: z.string(),
          user: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string().email(),
            type: z.string(),
            createdAt: z.string().or(z.date()),
          }),
        })
        .describe("Usuário criado com sucesso"),
      400: z
        .object({
          message: z.string(),
        })
        .describe("Erro ao criar usuário"),
    },
  },
  handler: userController.createUser.bind(userController),
});
```

#### 📊 Request/Response

**Request:**

```json
POST /users
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "medico"
}
```

**Response (201):**

```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "medico",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 📄 Rota: GET /users

**Linha 42-80**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/users",
  schema: {
    tags: ["Usuários"],
    summary: "Listar todos os usuários com paginação",
    description:
      "Retorna a lista paginada de todos os usuários cadastrados no sistema",
    querystring: paginationSchema, // ← VALIDA QUERY PARAMS
    response: {
      200: z
        .object({
          data: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              email: z.string().email(),
              type: z.string(),
              createdAt: z.string().or(z.date()),
            })
          ),
          meta: z.object({
            currentPage: z.number(),
            itemsPerPage: z.number(),
            totalItems: z.number(),
            totalPages: z.number(),
            hasNextPage: z.boolean(),
            hasPreviousPage: z.boolean(),
          }),
        })
        .describe("Lista paginada de usuários"),
    },
  },
  handler: userController.getAllUsers.bind(userController),
});
```

#### 🔍 Query Parameters

```typescript
querystring: paginationSchema;

// Definido em schemas/pagination.schema.ts:
// {
//   page: string (default "1", convertido para number)
//   limit: string (default "10", convertido para number)
// }
```

**Exemplo de Request:**

```
GET /users?page=2&limit=5
```

**Exemplo de Response:**

```json
{
  "data": [
    {
      "id": 6,
      "name": "João Silva",
      "email": "joao@email.com",
      "type": "medico",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 7,
      "name": "Maria Santos",
      "email": "maria@email.com",
      "type": "paciente",
      "createdAt": "2024-01-14T15:20:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 2,
    "itemsPerPage": 5,
    "totalItems": 50,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

### 👤 Rota: GET /profile

**Linha 82-121**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/profile",
  onRequest: [app.authenticate], // ← MIDDLEWARE DE AUTENTICAÇÃO
  schema: {
    tags: ["Usuários"],
    summary: "Ver perfil do usuário autenticado",
    description:
      "Retorna os dados do perfil do usuário logado. Requer autenticação JWT.",
    security: [{ bearerAuth: [] }], // ← REQUER BEARER TOKEN
    response: {
      200: z
        .object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
          type: z.string(),
          createdAt: z.string().or(z.date()),
        })
        .describe("Perfil do usuário"),
      401: z
        .object({
          message: z.string(),
        })
        .describe("Não autorizado"),
      404: z
        .object({
          message: z.string(),
        })
        .describe("Usuário não encontrado"),
    },
  },
  handler: userController.getProfile.bind(userController),
});
```

#### 🔒 Rota Protegida

**Request:**

```
GET /profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**

```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "type": "medico",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

## 📚 Swagger Documentation

### O que é Swagger/OpenAPI?

**Swagger** é uma ferramenta que gera **documentação interativa** da API automaticamente.

#### 🌐 Acessar Documentação

```
http://localhost:3000/docs
```

#### ✨ Recursos do Swagger

1. **Visualização de Endpoints**
   - Todos os endpoints organizados por tags
   - Métodos HTTP (GET, POST, etc)
   - URLs completas

2. **Testar Endpoints**
   - Botão "Try it out"
   - Preencher parâmetros/body
   - Executar requisição direto no navegador
   - Ver response em tempo real

3. **Schemas de Validação**
   - Ver campos obrigatórios
   - Ver tipos de dados
   - Ver mensagens de erro
   - Ver exemplos de request/response

4. **Autenticação**
   - Botão "Authorize"
   - Inserir Bearer Token
   - Token aplicado em todas as rotas protegidas

---

### 🔧 Como Funciona?

#### 1. Definição dos Schemas

```typescript
schema: {
  tags: ["Autenticação"],          // Categoria no Swagger
  summary: "Realizar login",       // Título
  description: "Autentica...",     // Descrição
  body: loginSchema,               // Schema do request
  response: {                      // Schemas das responses
    200: z.object({ ... }),
    401: z.object({ ... })
  }
}
```

#### 2. Integração com Zod

```typescript
app.withTypeProvider<ZodTypeProvider>();
```

- **ZodTypeProvider** converte schemas Zod em OpenAPI
- Valida automaticamente request/response
- Gera documentação automaticamente

#### 3. Definição de Segurança

```typescript
// Em swagger.ts:
securitySchemes: {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
}

// Na rota:
security: [{ bearerAuth: [] }]
```

---

### 📸 Exemplo Visual do Swagger

```
┌─────────────────────────────────────────────┐
│ 📘 Health Diary Monitoring API v1.0.0       │
│                                             │
│ 🔐 Autenticação                             │
│   POST /login         Realizar login        │
│   POST /refresh       Renovar access token  │
│   POST /logout        Fazer logout          │
│   POST /logout-all    Logout (todos)     🔒 │
│                                             │
│ 👤 Usuários                                 │
│   POST /users         Criar novo usuário    │
│   GET /users          Listar usuários       │
│   GET /profile        Ver perfil         🔒 │
│                                             │
│ [🔓 Authorize] ← Inserir Bearer Token       │
└─────────────────────────────────────────────┘
```

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados

#### 1. **Sempre usar ZodTypeProvider**

```typescript
app.withTypeProvider<ZodTypeProvider>().route({ ... })
```

**Por quê?**

- Validação automática
- Type-safety em TypeScript
- Documentação automática

#### 2. **Definir tags para organização**

```typescript
tags: ["Autenticação"]; // Agrupa rotas no Swagger
```

#### 3. **Documentar todos os status de response**

```typescript
response: {
  200: z.object({ ... }).describe("Sucesso"),
  400: z.object({ ... }).describe("Erro de validação"),
  401: z.object({ ... }).describe("Não autorizado"),
  404: z.object({ ... }).describe("Não encontrado"),
  500: z.object({ ... }).describe("Erro interno"),
}
```

#### 4. **Usar middleware onRequest para autenticação**

```typescript
onRequest: [app.authenticate];
```

#### 5. **Documentar segurança com security**

```typescript
security: [{ bearerAuth: [] }];
```

#### 6. **Usar .bind() no handler**

```typescript
handler: authController.login.bind(authController);
```

**Por quê?**  
Garante que `this` dentro do controller aponta para a instância correta.

---

### 📝 Template de Rota

```typescript
app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",           // GET, POST, PUT, DELETE
  url: "/endpoint",         // Caminho da rota
  onRequest: [],            // Middlewares (opcional)
  schema: {
    tags: ["Categoria"],    // Organização no Swagger
    summary: "Título",      // Título curto
    description: "...",     // Descrição detalhada
    security: [],           // Autenticação (opcional)
    body: schema,           // Validação do body (opcional)
    querystring: schema,    // Validação de query params (opcional)
    params: schema,         // Validação de URL params (opcional)
    response: {             // Schemas de resposta
      200: z.object({ ... }).describe("Sucesso"),
      400: z.object({ ... }).describe("Erro"),
    },
  },
  handler: controller.method.bind(controller),
});
```

---

## 📖 Resumo de Conceitos

### 🔑 Principais Componentes

| Componente  | O que é?                 | Exemplo                                |
| ----------- | ------------------------ | -------------------------------------- |
| `method`    | Método HTTP              | `"POST"`, `"GET"`, `"PUT"`, `"DELETE"` |
| `url`       | Caminho da rota          | `"/login"`, `"/users/:id"`             |
| `schema`    | Configuração e validação | Zod schemas, docs Swagger              |
| `handler`   | Função que processa      | `controller.method`                    |
| `onRequest` | Middlewares              | `[app.authenticate]`                   |
| `tags`      | Categoria no Swagger     | `["Autenticação"]`                     |
| `security`  | Requer autenticação      | `[{ bearerAuth: [] }]`                 |

---

## 🔄 Fluxo de uma Requisição

```
1. Frontend envia:
   POST /login { email, password }
   ↓
2. Fastify recebe e encontra a rota:
   url: "/login", method: "POST"
   ↓
3. Zod valida request.body:
   ✅ email é string válida?
   ✅ password tem min 6 caracteres?
   ↓
4. Executa middlewares (se houver):
   onRequest: [app.authenticate]
   ↓
5. Chama handler:
   authController.login(request, reply)
   ↓
6. Controller processa e retorna:
   reply.status(200).send({ ... })
   ↓
7. Fastify envia response para frontend
```

---

## 📚 Referências Rápidas

### 📦 Estrutura de Rota

```typescript
{
  method: "POST",
  url: "/endpoint",
  onRequest: [middleware1, middleware2],
  schema: {
    tags: ["Categoria"],
    summary: "Título",
    description: "Descrição detalhada",
    security: [{ bearerAuth: [] }],
    body: zodSchema,
    querystring: zodSchema,
    params: zodSchema,
    response: {
      200: zodSchema.describe("Sucesso"),
      400: zodSchema.describe("Erro")
    }
  },
  handler: controller.method.bind(controller)
}
```

### 🔍 Tipos de Validação

```typescript
// Body (POST/PUT):
body: loginSchema;

// Query params (GET):
querystring: paginationSchema; // ?page=1&limit=10

// URL params:
params: z.object({ id: z.string() }); // /users/:id

// Headers:
headers: z.object({ "x-api-key": z.string() });
```

---

## 📖 Próximos Documentos

- **[03-SERVICES.md](03-SERVICES.md)** - Lógica de negócio
- **[04-CONTROLLERS.md](04-CONTROLLERS.md)** - Processamento de requisições
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Validação com Zod
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização
- **[08-PLUGINS.md](08-PLUGINS.md)** - Configuração do Fastify

---

**[⬅️ Voltar para Controllers](04-CONTROLLERS.md)** | **[➡️ Ir para Schemas](06-SCHEMAS.md)**
