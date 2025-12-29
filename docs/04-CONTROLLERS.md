# 🎮 Controllers - Processamento de Requisições HTTP

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que são Controllers?](#o-que-são-controllers)
2. [auth.controller.ts](#authcontrollerts)
3. [user.controller.ts](#usercontrollerts)
4. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que são Controllers?

**Controllers** são responsáveis por **processar requisições HTTP** e **formatar respostas**. Eles:

- ✅ Recebem dados do cliente (request)
- ✅ Chamam Services para executar lógica de negócio
- ✅ Formatam e enviam respostas (reply)
- ✅ Tratam erros e retornam status HTTP corretos
- ✅ NÃO contêm lógica de negócio (isso fica nos Services)

### 🏗️ Posição na Arquitetura

```
┌──────────────────┐
│   Frontend/App   │  ← Envia requisição HTTP
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Routes       │  ← Define URL e método (POST, GET, etc)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   CONTROLLERS    │  ← Processa request e response (ESTA CAMADA)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Services      │  ← Executa lógica de negócio
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Banco de Dados  │
└──────────────────┘
```

---

## 🔐 auth.controller.ts

**Localização:** `src/controllers/auth.controller.ts`  
**Responsabilidade:** Processar requisições de autenticação

### 📝 Estrutura do Arquivo

```typescript
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginInput, RefreshTokenInput } from "../schemas/auth.schema.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export class AuthController {
  // ... métodos
}
```

#### 📦 Imports Explicados

| Import              | O que é?          | Para que serve?                        |
| ------------------- | ----------------- | -------------------------------------- |
| `FastifyReply`      | Tipo do Fastify   | Tipar objeto de resposta HTTP          |
| `FastifyRequest`    | Tipo do Fastify   | Tipar objeto de requisição HTTP        |
| `LoginInput`        | Tipo Zod          | Garantir que body tem email e password |
| `RefreshTokenInput` | Tipo Zod          | Garantir que body tem refreshToken     |
| `AuthService`       | Classe de serviço | Executar lógica de autenticação        |

---

### 🔑 Método: `login()`

**Linha 8-43**

```typescript
async login(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  try {
    const user = await authService.login(request.body);

    // Gerar access token JWT (válido por 1 hora)
    const accessToken = request.server.jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: user.type,
      },
      { expiresIn: "1h" }
    );

    // Gerar refresh token (válido por 90 dias)
    const refreshToken = await authService.generateRefreshToken(user.id);

    return reply.status(200).send({
      message: "Login realizado com sucesso",
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hora em segundos
      user,
    });
  } catch (error) {
    return reply.status(401).send({
      message:
        error instanceof Error ? error.message : "Erro ao realizar login",
    });
  }
}
```

#### 🎯 O que esse método faz?

1. ✅ Valida credenciais (chama AuthService)
2. ✅ Gera **Access Token** (JWT, válido por 1 hora)
3. ✅ Gera **Refresh Token** (válido por 90 dias)
4. ✅ Retorna tokens e dados do usuário
5. ✅ Trata erros e retorna status 401 se falhar

#### 🔧 Linha por Linha

| Linha | Código                                      | Explicação                                          |
| ----- | ------------------------------------------- | --------------------------------------------------- |
| 9-10  | `FastifyRequest<{ Body: LoginInput }>`      | Tipo do request: body deve ter `email` e `password` |
| 11    | `FastifyReply`                              | Tipo do reply (resposta HTTP)                       |
| 14    | `authService.login(request.body)`           | Chama service para validar credenciais              |
| 17-22 | `request.server.jwt.sign(...)`              | Gera JWT (Access Token) assinado                    |
| 18-21 | `{ id, email, type }`                       | **Payload** do JWT (dados armazenados no token)     |
| 22    | `{ expiresIn: "1h" }`                       | Token expira em 1 hora                              |
| 25    | `authService.generateRefreshToken(user.id)` | Gera e salva refresh token no BD                    |
| 27-33 | `reply.status(200).send({ ... })`           | Retorna sucesso com status 200                      |
| 28    | `message`                                   | Mensagem de sucesso                                 |
| 29    | `accessToken`                               | JWT para autenticação nas próximas requisições      |
| 30    | `refreshToken`                              | Token para renovar o accessToken quando expirar     |
| 31    | `expiresIn: 3600`                           | 1 hora = 3600 segundos                              |
| 32    | `user`                                      | Dados do usuário (sem senha)                        |
| 35    | `reply.status(401)`                         | **401 Unauthorized** = credenciais inválidas        |

#### 🔒 O que é JWT?

**JWT (JSON Web Token)** é um token que armazena dados de forma **assinada** e **criptografada**.

```typescript
// Payload (dados que vão dentro do token):
const payload = {
  id: 1,
  email: "joao@email.com",
  type: "USER",
};

// Gerar JWT:
const accessToken = request.server.jwt.sign(payload, { expiresIn: "1h" });

// Resultado (exemplo):
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqb2FvQGVtYWlsLmNvbSIsInR5cGUiOiJVU0VSIn0.abcd1234..."
```

**Estrutura do JWT:**

```
header.payload.signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (algoritmo)
.
eyJpZCI6MSwiZW1haWwiOiJqb2FvQGVtYWls...  ← Payload (dados em base64)
.
abcd1234efgh5678...                      ← Signature (assinatura)
```

#### 🆚 Access Token vs Refresh Token

|                        | **Access Token (JWT)**     | **Refresh Token**                      |
| ---------------------- | -------------------------- | -------------------------------------- |
| **Duração**            | 1 hora                     | 90 dias                                |
| **Armazenamento**      | Não salvo no BD            | Salvo no BD                            |
| **Uso**                | Enviado em TODA requisição | Usado apenas para renovar access token |
| **Tamanho**            | Pequeno (~200 caracteres)  | Grande (128 caracteres)                |
| **Pode ser revogado?** | Não (expira sozinho)       | Sim (campo `revoked` no BD)            |

#### 📊 Fluxo de Login Completo

```
1. Frontend envia:
   POST /login
   {
     "email": "joao@email.com",
     "password": "senha123"
   }
   ↓
2. Controller recebe e chama authService.login()
   ↓
3. Service valida credenciais
   ✅ Email existe?
   ✅ Senha correta?
   ↓
4. Controller gera tokens:
   - Access Token (JWT, 1h)
   - Refresh Token (BD, 90 dias)
   ↓
5. Controller retorna:
   {
     "message": "Login realizado com sucesso",
     "accessToken": "eyJhbGciOiJIUzI1...",
     "refreshToken": "a3f7b2c1...",
     "expiresIn": 3600,
     "user": { id: 1, name: "João", ... }
   }
   ↓
6. Frontend salva tokens:
   - accessToken → Memória (state/context)
   - refreshToken → AsyncStorage/LocalStorage
```

#### 🔐 Como o Frontend usa os tokens?

```javascript
// Salvar tokens após login:
const response = await fetch("/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const { accessToken, refreshToken } = await response.json();

// Salvar no storage
await AsyncStorage.setItem("accessToken", accessToken);
await AsyncStorage.setItem("refreshToken", refreshToken);

// Usar accessToken em requisições:
const accessToken = await AsyncStorage.getItem("accessToken");
const response = await fetch("/profile", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

---

### 🔄 Método: `refresh()`

**Linha 45-74**

```typescript
async refresh(
  request: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = request.body;

    // Validar refresh token
    const user = await authService.validateRefreshToken(refreshToken);

    // Gerar novo access token
    const newAccessToken = request.server.jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: user.type,
      },
      { expiresIn: "1h" }
    );

    return reply.status(200).send({
      message: "Token renovado com sucesso",
      accessToken: newAccessToken,
      expiresIn: 3600,
    });
  } catch (error) {
    return reply.status(401).send({
      message:
        error instanceof Error ? error.message : "Erro ao renovar token",
    });
  }
}
```

#### 🎯 O que esse método faz?

**Renova o Access Token usando um Refresh Token válido**. Usado quando o access token expira (após 1 hora).

#### 🔧 Explicação

| Linha | Código                                           | O que faz?                                  |
| ----- | ------------------------------------------------ | ------------------------------------------- |
| 52    | `const { refreshToken } = request.body`          | Extrai refresh token do body                |
| 55    | `authService.validateRefreshToken(refreshToken)` | Valida: existe? não revogado? não expirado? |
| 58-64 | `request.server.jwt.sign(...)`                   | Gera NOVO access token (1h)                 |
| 66-70 | `reply.status(200).send({ ... })`                | Retorna novo access token                   |

#### 📊 Fluxo de Renovação de Token

```
1. Frontend detecta access token expirado
   (erro 401 ou verificação de expiresAt)
   ↓
2. Frontend envia:
   POST /refresh
   {
     "refreshToken": "a3f7b2c1..."
   }
   ↓
3. Controller valida refresh token:
   ✅ Existe no BD?
   ✅ Não foi revogado?
   ✅ Não expirou?
   ↓
4. Controller gera NOVO access token (1h)
   ↓
5. Controller retorna:
   {
     "message": "Token renovado com sucesso",
     "accessToken": "eyJhbGciOiJIUzI1...",  ← NOVO
     "expiresIn": 3600
   }
   ↓
6. Frontend substitui o access token antigo
```

#### 🔄 Quando usar?

```javascript
// Exemplo de interceptor (React Native):
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Access token expirou, renovar
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const response = await fetch("/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });

      const { accessToken } = await response.json();
      await AsyncStorage.setItem("accessToken", accessToken);

      // Retentar requisição original
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

### 🚪 Método: `logout()`

**Linha 76-94**

```typescript
async logout(
  request: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply
) {
  try {
    const { refreshToken } = request.body;

    // Revogar o refresh token
    await authService.revokeRefreshToken(refreshToken);

    return reply.status(200).send({
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    return reply.status(400).send({
      message:
        error instanceof Error ? error.message : "Erro ao fazer logout",
    });
  }
}
```

#### 🎯 O que esse método faz?

**Revoga (invalida) um refresh token específico**. Usado quando o usuário faz logout de um dispositivo.

#### 🔧 Explicação

| Linha | Código                                         | O que faz?                   |
| ----- | ---------------------------------------------- | ---------------------------- |
| 83    | `const { refreshToken } = request.body`        | Extrai token do body         |
| 86    | `authService.revokeRefreshToken(refreshToken)` | Marca `revoked = true` no BD |
| 88-90 | `reply.status(200)`                            | Retorna sucesso              |

#### 📊 Fluxo de Logout

```
1. Frontend:
   POST /logout
   {
     "refreshToken": "a3f7b2c1..."
   }
   ↓
2. Controller revoga token no BD:
   UPDATE refresh_token
   SET revoked = true
   WHERE token = "a3f7b2c1..."
   ↓
3. Frontend apaga tokens salvos:
   await AsyncStorage.removeItem("accessToken");
   await AsyncStorage.removeItem("refreshToken");
   ↓
4. Usuário redirecionado para tela de login
```

#### ⚠️ Importante

```typescript
// Access Token NÃO precisa ser revogado!
// Ele expira sozinho após 1 hora.

// Refresh Token PRECISA ser revogado!
// Caso contrário, pode ser usado até expirar (90 dias).
```

---

### 🌍 Método: `logoutAll()`

**Linha 96-115**

```typescript
async logoutAll(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).id;

    // Revogar todos os refresh tokens do usuário
    await authService.revokeAllUserTokens(userId);

    return reply.status(200).send({
      message: "Logout realizado em todos os dispositivos",
    });
  } catch (error) {
    return reply.status(400).send({
      message:
        error instanceof Error ? error.message : "Erro ao fazer logout",
    });
  }
}
```

#### 🎯 O que esse método faz?

**Revoga TODOS os refresh tokens do usuário**, fazendo logout de todos os dispositivos simultaneamente.

#### 🔧 Explicação

| Linha | Código                                    | O que faz?                                             |
| ----- | ----------------------------------------- | ------------------------------------------------------ |
| 99    | `(request.user as any).id`                | Extrai ID do usuário autenticado (vem do JWT)          |
| 102   | `authService.revokeAllUserTokens(userId)` | Marca TODOS os tokens do usuário como `revoked = true` |

#### 🔒 De onde vem `request.user`?

```typescript
// 1. Frontend envia access token no header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 2. Middleware authenticate() decodifica JWT:
const decoded = jwt.verify(token); // { id: 1, email: "...", type: "USER" }

// 3. Middleware adiciona ao request:
request.user = decoded;

// 4. Controller acessa:
const userId = request.user.id; // 1
```

#### 📊 Fluxo de Logout Global

```
1. Frontend:
   POST /logout-all
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1..."
   }
   ↓
2. Middleware authenticate() extrai userId do JWT
   ↓
3. Controller revoga TODOS os tokens:
   UPDATE refresh_token
   SET revoked = true
   WHERE userId = 1 AND revoked = false
   ↓
4. Todos os dispositivos do usuário ficam deslogados
   (refresh tokens não funcionam mais)
   ↓
5. Cada dispositivo precisa fazer login novamente
```

#### 🌍 Caso de Uso Real

```
Usuário percebe que perdeu o celular:
  ↓
Acessa pelo computador e clica "Sair de todos os dispositivos"
  ↓
POST /logout-all
  ↓
Celular perdido: refresh token revogado
Notebook: refresh token revogado
Computador do trabalho: refresh token revogado
  ↓
Todos os dispositivos precisam fazer login novamente
  ↓
Celular perdido: não consegue mais acessar a conta
```

---

## 👤 user.controller.ts

**Localização:** `src/controllers/user.controller.ts`  
**Responsabilidade:** Processar requisições de gerenciamento de usuários

### 📝 Estrutura do Arquivo

```typescript
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput } from "../schemas/user.schema.js";
import { PaginationInput } from "../schemas/pagination.schema.js";
import { UserService } from "../services/user.service.js";

const userService = new UserService();

export class UserController {
  // ... métodos
}
```

---

### ➕ Método: `createUser()`

**Linha 9-24**

```typescript
async createUser(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  try {
    const user = await userService.createUser(request.body);
    return reply.status(201).send({
      message: "Usuário criado com sucesso",
      user,
    });
  } catch (error) {
    return reply.status(400).send({
      message:
        error instanceof Error ? error.message : "Erro ao criar usuário",
    });
  }
}
```

#### 🎯 O que esse método faz?

Cria um novo usuário no banco de dados.

#### 🔧 Explicação

| Linha | Código                                      | O que faz?                                                    |
| ----- | ------------------------------------------- | ------------------------------------------------------------- |
| 10    | `FastifyRequest<{ Body: CreateUserInput }>` | Body deve ter: name, email, password, type                    |
| 14    | `userService.createUser(request.body)`      | Chama service para criar usuário                              |
| 15    | `reply.status(201)`                         | **201 Created** = recurso criado com sucesso                  |
| 20    | `reply.status(400)`                         | **400 Bad Request** = erro de validação (ex: email já existe) |

#### 📊 Status HTTP

| Status | Significado           | Quando usar               |
| ------ | --------------------- | ------------------------- |
| 200    | OK                    | Sucesso geral             |
| 201    | Created               | Recurso criado            |
| 400    | Bad Request           | Erro de validação/negócio |
| 401    | Unauthorized          | Credenciais inválidas     |
| 403    | Forbidden             | Sem permissão             |
| 404    | Not Found             | Recurso não encontrado    |
| 500    | Internal Server Error | Erro inesperado           |

---

### 📄 Método: `getAllUsers()`

**Linha 26-39**

```typescript
async getAllUsers(
  request: FastifyRequest<{ Querystring: PaginationInput }>,
  reply: FastifyReply
) {
  try {
    const paginatedUsers = await userService.getAllUsers(request.query);
    return reply.status(200).send(paginatedUsers);
  } catch (error) {
    return reply.status(500).send({
      message: "Erro ao buscar usuários",
    });
  }
}
```

#### 🎯 O que esse método faz?

Retorna lista de usuários com paginação.

#### 🔧 Explicação

| Linha | Código                                   | O que faz?                          |
| ----- | ---------------------------------------- | ----------------------------------- |
| 27    | `Querystring: PaginationInput`           | Query params: `?page=1&limit=10`    |
| 31    | `request.query`                          | Acessa query parameters da URL      |
| 32    | `userService.getAllUsers(request.query)` | Chama service com `{ page, limit }` |

#### 🔍 Query Parameters

```
GET /users?page=2&limit=5

request.query = {
  page: 2,
  limit: 5
}
```

#### 📦 Resposta

```json
{
  "data": [
    { "id": 6, "name": "João", "email": "joao@email.com", ... },
    { "id": 7, "name": "Maria", "email": "maria@email.com", ... },
    ...
  ],
  "meta": {
    "page": 2,
    "limit": 5,
    "totalItems": 50,
    "totalPages": 10
  }
}
```

---

### 👤 Método: `getProfile()`

**Linha 41-58**

```typescript
async getProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    return reply.status(200).send(user);
  } catch (error) {
    return reply.status(500).send({
      message: "Erro ao buscar perfil",
    });
  }
}
```

#### 🎯 O que esse método faz?

Retorna dados do usuário autenticado (perfil).

#### 🔧 Explicação

| Linha | Código                            | O que faz?                                      |
| ----- | --------------------------------- | ----------------------------------------------- |
| 44    | `(request.user as any).id`        | Pega ID do JWT (vem do middleware authenticate) |
| 45    | `userService.getUserById(userId)` | Busca usuário no BD                             |
| 47-49 | `if (!user)`                      | Se não encontrou, retorna 404                   |
| 51    | `reply.status(200).send(user)`    | Retorna dados do usuário                        |

#### 📊 Fluxo

```
1. Frontend:
   GET /profile
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1..."
   }
   ↓
2. Middleware authenticate() decodifica JWT:
   request.user = { id: 1, email: "...", type: "USER" }
   ↓
3. Controller extrai userId = 1
   ↓
4. Service busca usuário no BD
   ↓
5. Controller retorna:
   {
     "id": 1,
     "name": "João",
     "email": "joao@email.com",
     "type": "USER",
     "createdAt": "2024-01-15T..."
   }
```

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados nos Controllers

#### 1. **Sempre usar try/catch**

```typescript
try {
  const result = await service.method();
  return reply.status(200).send(result);
} catch (error) {
  return reply.status(400).send({
    message: error instanceof Error ? error.message : "Erro genérico",
  });
}
```

#### 2. **Usar status HTTP corretos**

```typescript
201; // Created (POST bem-sucedido)
200; // OK (GET/PUT bem-sucedido)
400; // Bad Request (erro de validação)
401; // Unauthorized (não autenticado)
403; // Forbidden (sem permissão)
404; // Not Found (recurso não existe)
500; // Internal Server Error (erro inesperado)
```

#### 3. **NÃO colocar lógica de negócio no controller**

```typescript
// ❌ ERRADO:
async createUser(request, reply) {
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const user = await prisma.user.create({ data: { ...request.body, password: hashedPassword } });
  return reply.status(201).send(user);
}

// ✅ CORRETO:
async createUser(request, reply) {
  const user = await userService.createUser(request.body);
  return reply.status(201).send({ message: "Usuário criado com sucesso", user });
}
```

#### 4. **Tipar request e reply corretamente**

```typescript
async createUser(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  // TypeScript sabe que request.body tem { name, email, password, type }
}
```

#### 5. **Retornar mensagens descritivas**

```typescript
// ❌ RUIM:
return reply.status(400).send({ message: "Erro" });

// ✅ BOM:
return reply.status(400).send({ message: "Email já está em uso" });
```

---

## 📖 Resumo de Responsabilidades

### ❌ Controllers NÃO devem:

- Acessar banco de dados diretamente
- Conter regras de negócio
- Fazer hash de senhas
- Gerar tokens (exceto JWT)
- Validar dados (isso é feito pelo Zod nos schemas)

### ✅ Controllers DEVEM:

- Receber dados do request
- Chamar services
- Formatar respostas
- Retornar status HTTP corretos
- Tratar erros

---

## 🔄 Fluxo Completo de uma Requisição

```
1. Frontend:
   POST /login { email, password }
   ↓
2. Route:
   Define URL, método, schema de validação
   ↓
3. Zod valida request.body:
   ✅ email é string válida?
   ✅ password tem no mínimo 6 caracteres?
   ↓
4. Controller.login():
   - Chama authService.login(request.body)
   - Gera access token
   - Gera refresh token
   - Retorna reply.status(200).send({ ... })
   ↓
5. Service.login():
   - Busca usuário no BD
   - Compara senha com bcrypt
   - Retorna usuário sem senha
   ↓
6. Response enviada para frontend:
   {
     "message": "Login realizado com sucesso",
     "accessToken": "...",
     "refreshToken": "...",
     "user": { ... }
   }
```

---

## 📚 Referências Rápidas

### 📦 Estrutura de Response

```typescript
// Sucesso:
return reply.status(200).send({
  message: "Operação bem-sucedida",
  data: resultado,
});

// Erro:
return reply.status(400).send({
  message: "Descrição do erro",
});
```

### 🔧 Acessar Dados do Request

```typescript
// Body (POST/PUT):
request.body;

// Query parameters (GET):
request.query; // ?page=1&limit=10

// URL parameters:
request.params; // /users/:id

// Headers:
request.headers;

// Usuário autenticado:
request.user; // Vem do JWT
```

### 🔐 Status de Autenticação

```typescript
200; // Login bem-sucedido
201; // Registro bem-sucedido
401; // Credenciais inválidas / Token expirado
403; // Sem permissão (ex: não é ADMIN)
```

---

## 📖 Próximos Documentos

- **[03-SERVICES.md](03-SERVICES.md)** - Lógica de negócio
- **[05-ROUTES.md](05-ROUTES.md)** - Definição de endpoints e Swagger
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Validação com Zod
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização

---

**[⬅️ Voltar para Services](03-SERVICES.md)** | **[➡️ Ir para Routes](05-ROUTES.md)**
