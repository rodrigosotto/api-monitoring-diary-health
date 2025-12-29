# 🛡️ Middlewares - Autenticação e Autorização

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que são Middlewares?](#o-que-são-middlewares)
2. [auth.middleware.ts](#authmiddlewarets)
3. [Fluxo de Autenticação](#fluxo-de-autenticação)
4. [Casos de Uso](#casos-de-uso)
5. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que são Middlewares?

**Middlewares** são funções que **interceptam requisições** antes de chegarem ao handler. Eles são executados entre o recebimento da requisição e a execução do controller.

### ✨ Para que servem?

- ✅ **Autenticação:** Verificar se o usuário está logado
- ✅ **Autorização:** Verificar se o usuário tem permissão
- ✅ **Validação:** Verificar dados antes de processar
- ✅ **Logging:** Registrar informações da requisição
- ✅ **Rate Limiting:** Limitar número de requisições
- ✅ **Transformação:** Modificar request/response

---

## 🏗️ Posição na Arquitetura

```
┌──────────────────┐
│   Frontend/App   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  1. Fastify      │  ← Recebe requisição HTTP
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  2. MIDDLEWARE   │  ← Verifica autenticação/autorização (ESTA CAMADA)
│     (onRequest)  │     ✅ Token válido? Continua
└────────┬─────────┘     ❌ Token inválido? Retorna 401
         │
         ▼
┌──────────────────┐
│  3. Controller   │  ← Processa requisição
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  4. Service      │  ← Lógica de negócio
└──────────────────┘
```

---

## 🔐 auth.middleware.ts

**Localização:** `src/middlewares/auth.middleware.ts`  
**Responsabilidade:** Autenticação JWT e controle de acesso por role

### 📝 Código Completo

```typescript
import { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      message: "Token inválido ou ausente",
    });
  }
}

export async function checkRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { type: string };

      if (!allowedRoles.includes(user.type)) {
        return reply.status(403).send({
          message:
            "Acesso negado. Você não tem permissão para acessar este recurso.",
        });
      }
    } catch (error) {
      return reply.status(401).send({
        message: "Não autorizado",
      });
    }
  };
}
```

---

## 🔑 Função: `authenticate()`

**Linha 3-14**

```typescript
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      message: "Token inválido ou ausente",
    });
  }
}
```

### 🎯 O que essa função faz?

**Verifica se o usuário está autenticado** validando o JWT token no header `Authorization`.

---

### 🔧 Linha por Linha

| Linha | Código                                        | Explicação                                   |
| ----- | --------------------------------------------- | -------------------------------------------- |
| 3-5   | `async function authenticate(request, reply)` | Função assíncrona que recebe request e reply |
| 8     | `await request.jwtVerify()`                   | Verifica e decodifica JWT token              |
| 9-12  | `catch (error)`                               | Se token inválido/ausente, captura erro      |
| 10    | `reply.status(401)`                           | **401 Unauthorized** = não autenticado       |
| 11    | `message: "Token inválido ou ausente"`        | Mensagem de erro                             |

---

### 🔍 O que é `request.jwtVerify()`?

**Método fornecido pelo plugin `fastify-jwt`** que:

1. **Extrai token** do header `Authorization: Bearer <token>`
2. **Verifica assinatura** (garante que token não foi alterado)
3. **Verifica expiração** (token ainda é válido?)
4. **Decodifica payload** e adiciona a `request.user`

```typescript
// Antes:
request.user; // undefined

// Após jwtVerify():
request.user; // { id: 1, email: "joao@email.com", type: "medico" }
```

---

### 📊 Fluxo de Autenticação

```
1. Frontend envia requisição:
   GET /profile
   Headers:
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
2. Fastify recebe requisição
   ↓
3. Middleware authenticate() é executado:
   - Extrai token do header
   - Verifica assinatura
   - Verifica expiração
   ↓
4a. Token VÁLIDO:
    - Decodifica payload
    - Adiciona a request.user
    - Continua para o handler
    ↓
5a. Handler é executado:
    const userId = request.user.id;

4b. Token INVÁLIDO/AUSENTE:
    - Retorna 401
    - Handler NÃO é executado
```

---

### ✅ Exemplos de Uso

#### ✅ Token Válido

```typescript
// Request:
GET /profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// JWT decodificado:
{
  id: 1,
  email: "joao@email.com",
  type: "medico",
  iat: 1705318800,  // Issued at
  exp: 1705322400   // Expires at (1h)
}

// request.user:
{
  id: 1,
  email: "joao@email.com",
  type: "medico"
}

// Response (200):
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com",
  "type": "medico"
}
```

---

#### ❌ Token Ausente

```typescript
// Request:
GET /profile
// SEM header Authorization

// Response (401):
{
  "message": "Token inválido ou ausente"
}
```

---

#### ❌ Token Inválido

```typescript
// Request:
GET /profile
Headers:
  Authorization: Bearer abc123invalidtoken

// Response (401):
{
  "message": "Token inválido ou ausente"
}
```

---

#### ❌ Token Expirado

```typescript
// Request:
GET /profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (expirado)

// JWT decodificado:
{
  id: 1,
  email: "joao@email.com",
  exp: 1705318800  // ← Já passou!
}

// Response (401):
{
  "message": "Token inválido ou ausente"
}
```

---

### 🔧 Como usar na rota?

```typescript
// Em routes/user.routes.ts:
app.route({
  method: "GET",
  url: "/profile",
  onRequest: [app.authenticate], // ← Middleware aqui!
  handler: userController.getProfile,
});
```

**`onRequest`:** Array de middlewares executados ANTES do handler.

---

## 🎭 Função: `checkRole()`

**Linha 16-32**

```typescript
export async function checkRole(allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as { type: string };

      if (!allowedRoles.includes(user.type)) {
        return reply.status(403).send({
          message:
            "Acesso negado. Você não tem permissão para acessar este recurso.",
        });
      }
    } catch (error) {
      return reply.status(401).send({
        message: "Não autorizado",
      });
    }
  };
}
```

### 🎯 O que essa função faz?

**Verifica se o usuário tem permissão** (role) para acessar o recurso.

---

### 🔧 Linha por Linha

| Linha | Código                                          | Explicação                                        |
| ----- | ----------------------------------------------- | ------------------------------------------------- |
| 16    | `function checkRole(allowedRoles: string[])`    | Recebe array de roles permitidas                  |
| 17    | `return async (request, reply) => { ... }`      | Retorna middleware (Higher-Order Function)        |
| 20    | `const user = request.user as { type: string }` | Extrai usuário do request (já autenticado)        |
| 22    | `if (!allowedRoles.includes(user.type))`        | Verifica se role do usuário está permitida        |
| 23    | `reply.status(403)`                             | **403 Forbidden** = autenticado mas sem permissão |
| 28    | `catch (error)`                                 | Se não autenticado (user não existe)              |
| 29    | `reply.status(401)`                             | **401 Unauthorized**                              |

---

### 🎭 Higher-Order Function

```typescript
function checkRole(allowedRoles: string[]) {
  return async (request, reply) => {
    // ...
  };
}
```

**Função que RETORNA outra função**.

#### Por quê?

Permite **passar parâmetros** para o middleware:

```typescript
// ✅ Com checkRole:
onRequest: [app.authenticate, checkRole(["medico"])];

// ❌ Sem checkRole (não funciona):
onRequest: [app.authenticate, verifyRole]; // Como passar ["medico"]?
```

---

### 📊 Fluxo de Autorização

```
1. Frontend envia:
   GET /dashboard/medico
   Headers:
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ↓
2. Middleware authenticate() valida token:
   ✅ Token válido
   request.user = { id: 1, email: "...", type: "medico" }
   ↓
3. Middleware checkRole(["medico"]) verifica permissão:
   - user.type = "medico"
   - allowedRoles = ["medico"]
   - "medico" está em ["medico"]? ✅ Sim
   ↓
4. Handler é executado:
   return { message: "Dashboard do médico" }
```

---

### ✅ Exemplos de Uso

#### ✅ Usuário com Permissão

```typescript
// Request:
GET /dashboard/medico
Headers:
  Authorization: Bearer ... (type: "medico")

// user.type = "medico"
// allowedRoles = ["medico"]
// "medico" em ["medico"]? ✅ Sim

// Response (200):
{
  "message": "Dashboard do médico",
  "data": { ... }
}
```

---

#### ❌ Usuário sem Permissão

```typescript
// Request:
GET /dashboard/medico
Headers:
  Authorization: Bearer ... (type: "paciente")

// user.type = "paciente"
// allowedRoles = ["medico"]
// "paciente" em ["medico"]? ❌ Não

// Response (403):
{
  "message": "Acesso negado. Você não tem permissão para acessar este recurso."
}
```

---

#### ❌ Usuário não Autenticado

```typescript
// Request:
GET /dashboard/medico
// SEM header Authorization

// authenticate() já retornou 401
// checkRole() NÃO é executado

// Response (401):
{
  "message": "Token inválido ou ausente"
}
```

---

### 🔧 Como usar na rota?

```typescript
// Em routes/dashboard.routes.ts:
app.route({
  method: "GET",
  url: "/dashboard/medico",
  onRequest: [
    app.authenticate,           // 1. Verifica autenticação
    checkRole(["medico"])       // 2. Verifica role
  ],
  handler: dashboardController.medicoD dashboard
});
```

**Ordem importa!**

1. Primeiro: `authenticate()` valida token
2. Depois: `checkRole()` valida permissão

---

## 🆚 authenticate() vs checkRole()

|                    | **authenticate()**          | **checkRole()**                              |
| ------------------ | --------------------------- | -------------------------------------------- |
| **O que faz?**     | Verifica se está logado     | Verifica se tem permissão                    |
| **Quando usar?**   | Qualquer rota protegida     | Rotas com controle de acesso                 |
| **Status de erro** | 401 Unauthorized            | 403 Forbidden                                |
| **Mensagem**       | "Token inválido ou ausente" | "Acesso negado..."                           |
| **Depende de**     | Nada                        | `authenticate()` (precisa de `request.user`) |

---

### 📊 401 vs 403

| Status  | Nome         | Significado                   | Exemplo                                       |
| ------- | ------------ | ----------------------------- | --------------------------------------------- |
| **401** | Unauthorized | Não está autenticado          | Token ausente/inválido/expirado               |
| **403** | Forbidden    | Autenticado mas sem permissão | Paciente tentando acessar dashboard de médico |

---

## 🔄 Fluxo Completo de Autenticação

```
┌─────────────────────────────────────────────┐
│ Frontend envia requisição                   │
│ GET /profile                                │
│ Headers: Authorization: Bearer <token>      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Fastify recebe requisição                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Middleware: authenticate()                  │
│ 1. Extrai token do header                   │
│ 2. Verifica assinatura                      │
│ 3. Verifica expiração                       │
│ 4. Decodifica payload                       │
│ 5. Adiciona request.user                    │
└─────────────────┬───────────────────────────┘
                  │
           ┌──────┴──────┐
           │             │
    Token válido?   Token inválido
           │             │
           ▼             ▼
    ✅ Continua     ❌ Retorna 401
           │        "Token inválido"
           │             │
           │             └──► Fim
           │
           ▼
┌─────────────────────────────────────────────┐
│ Middleware: checkRole(["medico"])           │
│ 1. Extrai user.type                         │
│ 2. Verifica se está em allowedRoles         │
└─────────────────┬───────────────────────────┘
                  │
           ┌──────┴──────┐
           │             │
      Tem permissão? Sem permissão
           │             │
           ▼             ▼
    ✅ Continua     ❌ Retorna 403
           │        "Acesso negado"
           │             │
           │             └──► Fim
           │
           ▼
┌─────────────────────────────────────────────┐
│ Controller: userController.getProfile()     │
│ 1. Acessa request.user.id                   │
│ 2. Busca usuário no BD                      │
│ 3. Retorna dados                            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ Response 200:                               │
│ { id: 1, name: "João", ... }                │
└─────────────────────────────────────────────┘
```

---

## 📚 Casos de Uso

### 🔓 Rota Pública (sem middleware)

```typescript
app.route({
  method: "POST",
  url: "/login",
  // SEM onRequest (público)
  handler: authController.login,
});
```

**Qualquer pessoa pode acessar**.

---

### 🔒 Rota Protegida (apenas autenticado)

```typescript
app.route({
  method: "GET",
  url: "/profile",
  onRequest: [app.authenticate], // Apenas logado
  handler: userController.getProfile,
});
```

**Apenas usuários autenticados podem acessar**.

---

### 🎭 Rota com Controle de Acesso (role específico)

```typescript
app.route({
  method: "GET",
  url: "/dashboard/medico",
  onRequest: [
    app.authenticate, // 1. Deve estar logado
    checkRole(["medico"]), // 2. Deve ser médico
  ],
  handler: dashboardController.medicoDashboard,
});
```

**Apenas médicos autenticados podem acessar**.

---

### 🌍 Rota com Múltiplos Roles

```typescript
app.route({
  method: "GET",
  url: "/users",
  onRequest: [
    app.authenticate,
    checkRole(["medico", "admin"]), // Médico OU admin
  ],
  handler: userController.getAllUsers,
});
```

**Médicos e admins podem acessar**.

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados

#### 1. **Sempre retornar status HTTP correto**

```typescript
// 401: Não autenticado
return reply.status(401).send({ message: "Token inválido" });

// 403: Sem permissão
return reply.status(403).send({ message: "Acesso negado" });
```

---

#### 2. **Usar try/catch para capturar erros**

```typescript
try {
  await request.jwtVerify();
} catch (error) {
  return reply.status(401).send({ message: "Token inválido" });
}
```

---

#### 3. **Verificar autenticação antes de autorização**

```typescript
onRequest: [
  app.authenticate, // 1. Primeiro: verifica se está logado
  checkRole(["medico"]), // 2. Depois: verifica se tem permissão
];
```

---

#### 4. **Mensagens de erro descritivas**

```typescript
// ✅ BOM:
"Token inválido ou ausente";
"Acesso negado. Você não tem permissão para acessar este recurso.";

// ❌ RUIM:
"Erro";
"Não autorizado";
```

---

#### 5. **Higher-Order Function para middlewares parametrizados**

```typescript
function checkRole(allowedRoles: string[]) {
  return async (request, reply) => {
    // ...
  };
}
```

---

### 📖 Resumo

| Conceito           | O que é?                          | Quando usar?                      |
| ------------------ | --------------------------------- | --------------------------------- |
| **Middleware**     | Função executada antes do handler | Validações, autenticação, logging |
| **authenticate()** | Verifica JWT token                | Rotas protegidas (usuário logado) |
| **checkRole()**    | Verifica permissão (role)         | Rotas com controle de acesso      |
| **onRequest**      | Array de middlewares              | Aplicar middlewares na rota       |
| **401**            | Unauthorized                      | Token inválido/ausente/expirado   |
| **403**            | Forbidden                         | Autenticado mas sem permissão     |

---

## 🔧 Testes com cURL

### ✅ Teste: Rota protegida com token válido

```bash
# 1. Fazer login:
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'

# Response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   ...
# }

# 2. Acessar rota protegida:
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response (200):
# {
#   "id": 1,
#   "name": "João Silva",
#   ...
# }
```

---

### ❌ Teste: Rota protegida sem token

```bash
curl -X GET http://localhost:3000/profile

# Response (401):
# {
#   "message": "Token inválido ou ausente"
# }
```

---

### ❌ Teste: Rota com role específico (sem permissão)

```bash
# Usuário é "paciente", mas rota requer "medico"
curl -X GET http://localhost:3000/dashboard/medico \
  -H "Authorization: Bearer <token_de_paciente>"

# Response (403):
# {
#   "message": "Acesso negado. Você não tem permissão para acessar este recurso."
# }
```

---

## 📖 Próximos Documentos

- **[03-SERVICES.md](03-SERVICES.md)** - Lógica de negócio
- **[04-CONTROLLERS.md](04-CONTROLLERS.md)** - Processamento de requisições
- **[05-ROUTES.md](05-ROUTES.md)** - Definição de endpoints
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Validação com Zod
- **[08-PLUGINS.md](08-PLUGINS.md)** - Configuração do Fastify

---

**[⬅️ Voltar para Schemas](06-SCHEMAS.md)** | **[➡️ Ir para Plugins](08-PLUGINS.md)**
