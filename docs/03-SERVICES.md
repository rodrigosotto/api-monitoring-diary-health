# 📦 Services - Lógica de Negócio

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que são Services?](#o-que-são-services)
2. [auth.service.ts](#authservicets)
3. [user.service.ts](#userservicets)
4. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que são Services?

**Services** são classes que contêm a **lógica de negócio** da aplicação. Eles são responsáveis por:

- ✅ Interagir com o banco de dados (Prisma)
- ✅ Validar regras de negócio
- ✅ Processar dados
- ✅ Lançar erros específicos
- ✅ Manipular senhas (hash, compare)
- ✅ Gerenciar tokens de autenticação

### 🏗️ Arquitetura em Camadas

```
┌──────────────────┐
│     Routes       │  ← Define endpoints HTTP
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Controllers    │  ← Processa requisições/respostas
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Services      │  ← Lógica de negócio (ESTA CAMADA)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prisma Client   │  ← Acesso ao banco de dados
└──────────────────┘
```

---

## 🔐 auth.service.ts

**Localização:** `src/services/auth.service.ts`  
**Responsabilidade:** Autenticação e gerenciamento de refresh tokens

### 📝 Estrutura do Arquivo

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { LoginInput } from "../schemas/auth.schema.js";

const prisma = new PrismaClient();

export class AuthService {
  // ... métodos
}
```

#### 📦 Imports Explicados

| Import         | O que é?                   | Para que serve?                 |
| -------------- | -------------------------- | ------------------------------- |
| `PrismaClient` | Cliente do Prisma ORM      | Comunicação com PostgreSQL      |
| `bcrypt`       | Biblioteca de criptografia | Comparar senha com hash         |
| `crypto`       | Módulo nativo do Node.js   | Gerar tokens aleatórios seguros |
| `LoginInput`   | Tipo Zod                   | Validação de email e senha      |

---

### 🔍 Método: `login()`

**Linha 9-30**

```typescript
async login(data: LoginInput) {
  // Buscar usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  // Verificar senha
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Credenciais inválidas");
  }

  // Retornar dados do usuário (sem a senha)
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

#### 🎯 O que esse método faz?

1. **Busca o usuário no banco de dados** pelo email
2. **Verifica se o usuário existe**
3. **Compara a senha** fornecida com o hash armazenado
4. **Remove a senha** antes de retornar os dados

#### 🔧 Linha por Linha

| Linha | Código                                              | Explicação                                                            |
| ----- | --------------------------------------------------- | --------------------------------------------------------------------- |
| 12-14 | `prisma.user.findUnique({ where: { email } })`      | Busca 1 usuário com email específico. Retorna `null` se não encontrar |
| 16-18 | `if (!user) throw new Error(...)`                   | Se não encontrou, lança erro "Credenciais inválidas"                  |
| 21    | `bcrypt.compare(senha, hash)`                       | Compara senha em texto com hash do banco. Retorna `true` ou `false`   |
| 23-25 | `if (!isPasswordValid) throw new Error(...)`        | Se senha errada, lança erro                                           |
| 28    | `const { password, ...userWithoutPassword } = user` | **Desestruturação:** separa `password` do resto dos dados             |
| 29    | `return userWithoutPassword`                        | Retorna usuário SEM a senha (segurança)                               |

#### 💡 Por que remover a senha?

```typescript
// ❌ NUNCA faça isso:
return user; // { id: 1, email: "...", password: "$2a$10$..." }

// ✅ SEMPRE faça isso:
const { password, ...userWithoutPassword } = user;
return userWithoutPassword; // { id: 1, email: "...", name: "..." }
```

**Motivo:** A senha (mesmo hasheada) nunca deve ser enviada para o frontend!

---

### 🎫 Método: `generateRefreshToken()`

**Linha 32-49**

```typescript
async generateRefreshToken(userId: number) {
  // Gerar token único
  const token = crypto.randomBytes(64).toString("hex");

  // Data de expiração: 90 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  // Salvar no banco
  const refreshToken = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return refreshToken.token;
}
```

#### 🎯 O que esse método faz?

1. **Gera um token aleatório seguro** (128 caracteres hexadecimais)
2. **Define data de expiração** (90 dias no futuro)
3. **Salva no banco de dados**
4. **Retorna o token** para ser enviado ao cliente

#### 🔧 Linha por Linha

| Linha | Código                         | Explicação                                            |
| ----- | ------------------------------ | ----------------------------------------------------- |
| 34    | `crypto.randomBytes(64)`       | Gera 64 bytes aleatórios criptograficamente seguros   |
| 34    | `.toString("hex")`             | Converte bytes em string hexadecimal (128 caracteres) |
| 37    | `new Date()`                   | Cria objeto com data/hora atual                       |
| 38    | `.setDate(date + 90)`          | Adiciona 90 dias à data atual                         |
| 41-47 | `prisma.refreshToken.create()` | Insere novo registro na tabela `refresh_token`        |
| 49    | `return refreshToken.token`    | Retorna apenas a string do token                      |

#### 🔒 Por que usar `crypto.randomBytes()`?

```typescript
// ❌ NUNCA use Math.random() para tokens:
const token = Math.random().toString(); // INSEGURO!

// ✅ SEMPRE use crypto:
const token = crypto.randomBytes(64).toString("hex"); // SEGURO
```

**Motivo:** `Math.random()` é previsível, `crypto` é criptograficamente seguro.

#### 📅 Exemplo de Data

```javascript
const now = new Date(); // 2024-01-15
now.setDate(now.getDate() + 90); // 2024-04-15
```

---

### ✅ Método: `validateRefreshToken()`

**Linha 51-69**

```typescript
async validateRefreshToken(token: string) {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!refreshToken) {
    throw new Error("Refresh token inválido");
  }

  if (refreshToken.revoked) {
    throw new Error("Refresh token foi revogado");
  }

  if (refreshToken.expiresAt < new Date()) {
    throw new Error("Refresh token expirado");
  }

  const { password, ...userWithoutPassword } = refreshToken.user;
  return userWithoutPassword;
}
```

#### 🎯 O que esse método faz?

Valida um refresh token verificando:

1. ✅ Se o token existe no banco
2. ✅ Se não foi revogado
3. ✅ Se não expirou
4. ✅ Retorna os dados do usuário

#### 🔧 Linha por Linha

| Linha | Código                                                      | Explicação                                        |
| ----- | ----------------------------------------------------------- | ------------------------------------------------- |
| 52-55 | `findUnique({ where: { token }, include: { user: true } })` | Busca token E inclui dados do usuário relacionado |
| 57-59 | `if (!refreshToken)`                                        | Se não encontrou, token não existe                |
| 61-63 | `if (refreshToken.revoked)`                                 | Se `revoked = true`, token foi invalidado         |
| 65-67 | `if (expiresAt < new Date())`                               | Se data de expiração já passou, token expirado    |
| 69-70 | Remove senha e retorna usuário                              | Segurança: nunca retornar senha                   |

#### 🔍 O que é `include`?

```typescript
// SEM include:
const refreshToken = await prisma.refreshToken.findUnique({
  where: { token: "abc..." },
});
// Resultado: { id: 1, token: "abc...", userId: 5, expiresAt: ..., revoked: false }

// COM include:
const refreshToken = await prisma.refreshToken.findUnique({
  where: { token: "abc..." },
  include: { user: true },
});
// Resultado: {
//   id: 1,
//   token: "abc...",
//   userId: 5,
//   user: { id: 5, name: "João", email: "joao@email.com", ... }
// }
```

**`include`** faz um **JOIN** automático e traz dados relacionados!

#### 📊 Fluxo de Validação

```
┌─────────────────┐
│ Token recebido  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Buscar no BD    │ ─── Não encontrou? ─── ❌ Erro
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ revoked = true? │ ─── Sim? ─── ❌ Erro
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ expiresAt < now?│ ─── Sim? ─── ❌ Erro
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Token válido │
└─────────────────┘
```

---

### 🚫 Método: `revokeRefreshToken()`

**Linha 71-76**

```typescript
async revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}
```

#### 🎯 O que esse método faz?

**Revoga (invalida) um refresh token específico**. Usado quando o usuário faz logout.

#### 🔧 Explicação

| Comando                   | O que faz?                                          |
| ------------------------- | --------------------------------------------------- |
| `updateMany`              | Atualiza múltiplos registros que atendam a condição |
| `where: { token }`        | Encontra registros com esse token                   |
| `data: { revoked: true }` | Marca `revoked = true`                              |

#### ❓ Por que `updateMany` ao invés de `update`?

```typescript
// update: exige que exista 1 único registro
await prisma.refreshToken.update({
  where: { token }, // ERRO se não existir
  data: { revoked: true },
});

// updateMany: não dá erro se não encontrar nada
await prisma.refreshToken.updateMany({
  where: { token }, // Sem erro, apenas não atualiza nada
  data: { revoked: true },
});
```

**`updateMany`** é mais seguro: não quebra se o token já foi deletado ou não existe.

---

### 🚪 Método: `revokeAllUserTokens()`

**Linha 78-83**

```typescript
async revokeAllUserTokens(userId: number) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}
```

#### 🎯 O que esse método faz?

**Revoga TODOS os refresh tokens ativos de um usuário**. Usado para "logout de todos os dispositivos".

#### 🔍 Condição `where`

```typescript
where: { userId, revoked: false }
```

Isso busca:

- Tokens do usuário específico (`userId`)
- Que ainda estão ativos (`revoked: false`)

#### 🌍 Caso de Uso Real

```
Usuário logado em:
- 📱 Celular
- 💻 Notebook
- 🖥️ Computador do trabalho

Usuário clica "Sair de todos os dispositivos"
↓
revokeAllUserTokens(userId: 1)
↓
Todos os 3 tokens são marcados como revoked = true
↓
Todos os dispositivos precisam fazer login novamente
```

---

### 🧹 Método: `cleanExpiredTokens()`

**Linha 85-92**

```typescript
async cleanExpiredTokens() {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
```

#### 🎯 O que esse método faz?

**Deleta tokens expirados** do banco de dados para economizar espaço.

#### 🔧 Explicação

| Código                          | Significado                    |
| ------------------------------- | ------------------------------ |
| `deleteMany`                    | Deleta múltiplos registros     |
| `expiresAt: { lt: new Date() }` | `lt` = "less than" (menor que) |
| `new Date()`                    | Data/hora atual                |

**Tradução:** "Delete todos os tokens onde `expiresAt` é menor que agora"

#### 📅 Exemplo Visual

```
Hoje: 2024-01-15

Token 1: expiresAt = 2024-01-10 ← DELETADO (já passou)
Token 2: expiresAt = 2024-01-20 ← MANTIDO (ainda válido)
Token 3: expiresAt = 2023-12-25 ← DELETADO (já passou)
```

#### ⏰ Quando executar?

Este método deve ser executado periodicamente:

```typescript
// Exemplo: executar a cada 24 horas
setInterval(
  async () => {
    await authService.cleanExpiredTokens();
    console.log("Tokens expirados removidos");
  },
  24 * 60 * 60 * 1000
); // 24 horas em milissegundos
```

Ou usar um **cron job** (agendador de tarefas).

---

## 👤 user.service.ts

**Localização:** `src/services/user.service.ts`  
**Responsabilidade:** Gerenciamento de usuários (CRUD + paginação)

### 📝 Estrutura do Arquivo

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CreateUserInput } from "../schemas/user.schema.js";
import {
  calculatePagination,
  createPaginatedResponse,
  PaginationParams,
} from "../utils/pagination.js";

const prisma = new PrismaClient();

export class UserService {
  // ... métodos
}
```

#### 📦 Imports Explicados

| Import                    | Para que serve?            |
| ------------------------- | -------------------------- |
| `PrismaClient`            | Acessar banco de dados     |
| `bcrypt`                  | Criar hash de senha        |
| `CreateUserInput`         | Tipo Zod para validação    |
| `calculatePagination`     | Calcular skip/take         |
| `createPaginatedResponse` | Formatar resposta paginada |
| `PaginationParams`        | Tipo para page/limit       |

---

### ➕ Método: `createUser()`

**Linha 13-34**

```typescript
async createUser(data: CreateUserInput) {
  // Verificar se o email já está em uso
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email já está em uso");
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });

  // Retornar usuário sem a senha
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
```

#### 🎯 O que esse método faz?

1. ✅ Verifica se o email já existe
2. ✅ Cria hash da senha
3. ✅ Salva usuário no banco
4. ✅ Retorna dados sem a senha

#### 🔧 Linha por Linha

| Linha | Código                                | Explicação                          |
| ----- | ------------------------------------- | ----------------------------------- |
| 15-17 | `findUnique({ where: { email } })`    | Busca usuário com esse email        |
| 19-21 | `if (existingUser)`                   | Se já existe, lança erro            |
| 24    | `bcrypt.hash(password, 10)`           | Cria hash com 10 rounds de salt     |
| 27-32 | `prisma.user.create({ data: {...} })` | Cria novo registro na tabela `user` |
| 28-30 | `...data, password: hashedPassword`   | Spread operator + sobrescreve senha |
| 35-36 | Remove senha e retorna                | Segurança                           |

#### 🔒 O que é `bcrypt.hash()`?

```typescript
const password = "senha123";
const hashedPassword = await bcrypt.hash(password, 10);

console.log(password); // "senha123"
console.log(hashedPassword); // "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
```

**Parâmetros:**

- `password`: Senha em texto plano
- `10`: **Salt rounds** (quanto maior, mais seguro e mais lento)

#### 📊 Spread Operator Explicado

```typescript
const data = {
  name: "João",
  email: "joao@email.com",
  password: "senha123",
  type: "USER",
};

const hashedPassword = "$2a$10$...";

// ...data copia todos os campos de data
const newUser = {
  ...data,
  password: hashedPassword, // sobrescreve password
};

// Resultado:
// {
//   name: "João",
//   email: "joao@email.com",
//   password: "$2a$10$...",  ← hash ao invés de senha original
//   type: "USER"
// }
```

---

### 📄 Método: `getAllUsers()`

**Linha 36-58**

```typescript
async getAllUsers(paginationParams: PaginationParams) {
  const { skip, take } = calculatePagination(paginationParams);

  // Buscar usuários com paginação
  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count(),
  ]);

  return createPaginatedResponse(users, paginationParams, totalItems);
}
```

#### 🎯 O que esse método faz?

Retorna lista de usuários com **paginação**, executando 2 queries **em paralelo**:

1. Buscar usuários da página atual
2. Contar total de usuários

#### 🔧 Linha por Linha

| Linha | Código                                  | Explicação                                          |
| ----- | --------------------------------------- | --------------------------------------------------- |
| 37    | `calculatePagination(paginationParams)` | Converte `page/limit` em `skip/take`                |
| 40    | `Promise.all([...])`                    | Executa múltiplas Promises em paralelo              |
| 41-54 | `prisma.user.findMany()`                | Busca usuários com filtros                          |
| 42    | `skip`                                  | Quantos registros pular                             |
| 43    | `take`                                  | Quantos registros retornar                          |
| 44-49 | `select`                                | Quais campos incluir no resultado                   |
| 51-53 | `orderBy`                               | Ordenar por data de criação (mais recente primeiro) |
| 55    | `prisma.user.count()`                   | Conta TODOS os usuários (sem paginação)             |
| 58    | `createPaginatedResponse()`             | Formata resposta com meta (page, totalPages, etc)   |

#### 📊 Como funciona `calculatePagination()`?

```typescript
// Exemplo 1: Página 1, limite 10
calculatePagination({ page: 1, limit: 10 });
// Retorna: { skip: 0, take: 10 }
// SQL equivalente: LIMIT 10 OFFSET 0

// Exemplo 2: Página 2, limite 10
calculatePagination({ page: 2, limit: 10 });
// Retorna: { skip: 10, take: 10 }
// SQL equivalente: LIMIT 10 OFFSET 10

// Exemplo 3: Página 3, limite 5
calculatePagination({ page: 3, limit: 5 });
// Retorna: { skip: 10, take: 5 }
// SQL equivalente: LIMIT 5 OFFSET 10
```

**Fórmula:** `skip = (page - 1) * limit`

#### ⚡ Por que usar `Promise.all()`?

```typescript
// ❌ SEM Promise.all (LENTO):
const users = await prisma.user.findMany({ ... }); // 100ms
const totalItems = await prisma.user.count(); // 50ms
// Total: 150ms

// ✅ COM Promise.all (RÁPIDO):
const [users, totalItems] = await Promise.all([
  prisma.user.findMany({ ... }), // 100ms
  prisma.user.count(), // 50ms
]);
// Total: 100ms (executam ao mesmo tempo!)
```

**Promise.all()** executa as queries **simultaneamente** ao invés de sequencialmente!

#### 🔍 O que é `select`?

```typescript
// SEM select: retorna TODOS os campos
await prisma.user.findMany();
// { id, name, email, password, type, createdAt, ... }

// COM select: retorna APENAS campos especificados
await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
// { id, name, email }
```

**Vantagens:**

- ✅ Menos dados trafegados
- ✅ Mais rápido
- ✅ Mais seguro (não vaza campos sensíveis como password)

#### 📦 Formato da Resposta

```json
{
  "data": [
    { "id": 1, "name": "João", "email": "joao@email.com", ... },
    { "id": 2, "name": "Maria", "email": "maria@email.com", ... },
    ...
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5
  }
}
```

---

### 🔍 Método: `getUserById()`

**Linha 60-71**

```typescript
async getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      type: true,
      createdAt: true,
    },
  });
  return user;
}
```

#### 🎯 O que esse método faz?

Busca um usuário específico pelo ID (sem retornar a senha).

#### 🔧 Explicação

| Código          | O que faz?                                         |
| --------------- | -------------------------------------------------- |
| `findUnique`    | Busca 1 único registro                             |
| `where: { id }` | Filtro: usuário com esse ID                        |
| `select`        | Retorna apenas campos especificados (sem password) |

#### ⚠️ Possível Retorno `null`

```typescript
const user = await getUserById(999); // ID não existe
console.log(user); // null

// No controller, devemos verificar:
if (!user) {
  return reply.status(404).send({ message: "Usuário não encontrado" });
}
```

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados nos Services

#### 1. **Sempre remover senha antes de retornar**

```typescript
const { password, ...userWithoutPassword } = user;
return userWithoutPassword;
```

#### 2. **Lançar erros descritivos**

```typescript
throw new Error("Credenciais inválidas"); // ✅ Específico
throw new Error("Erro"); // ❌ Genérico
```

#### 3. **Validar regras de negócio**

```typescript
if (existingUser) {
  throw new Error("Email já está em uso");
}
```

#### 4. **Usar Promise.all() para queries paralelas**

```typescript
const [users, totalItems] = await Promise.all([
  prisma.user.findMany(),
  prisma.user.count(),
]);
```

#### 5. **Usar select para retornar apenas campos necessários**

```typescript
select: {
  id: true,
  name: true,
  email: true,
  // NÃO incluir password
}
```

---

### 📚 Referências Rápidas

#### 🔒 Bcrypt

```typescript
// Criar hash
const hash = await bcrypt.hash("senha", 10);

// Comparar
const isValid = await bcrypt.compare("senha", hash);
```

#### 🎲 Crypto

```typescript
// Gerar token aleatório
const token = crypto.randomBytes(64).toString("hex");
```

#### 📊 Prisma Queries

```typescript
// Buscar um único
await prisma.user.findUnique({ where: { id } });

// Buscar múltiplos
await prisma.user.findMany({ skip: 0, take: 10 });

// Criar
await prisma.user.create({ data: { ... } });

// Atualizar
await prisma.user.update({ where: { id }, data: { ... } });

// Deletar
await prisma.user.delete({ where: { id } });

// Contar
await prisma.user.count();
```

---

## 🔄 Fluxo Completo de Autenticação

```
1. Frontend: POST /login { email, password }
   ↓
2. Controller: authController.login()
   ↓
3. Service: authService.login()
   ├─ Busca usuário no BD
   ├─ Compara senha com bcrypt
   └─ Retorna usuário (sem password)
   ↓
4. Controller: Gera accessToken (JWT) e refreshToken
   ↓
5. Service: authService.generateRefreshToken()
   ├─ Gera token com crypto
   ├─ Define expiração (90 dias)
   └─ Salva no BD
   ↓
6. Controller: Retorna tokens para frontend
```

---

## 📖 Próximos Documentos

- **[04-CONTROLLERS.md](04-CONTROLLERS.md)** - Processamento de requisições HTTP
- **[05-ROUTES.md](05-ROUTES.md)** - Definição de endpoints e Swagger
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Validação com Zod
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização
- **[08-PLUGINS.md](08-PLUGINS.md)** - Configuração do Fastify

---

**[⬅️ Voltar para Estrutura de Pastas](02-ESTRUTURA-PASTAS.md)** | **[➡️ Ir para Controllers](04-CONTROLLERS.md)**
