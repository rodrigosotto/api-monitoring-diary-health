# ✅ Schemas - Validação com Zod

> **Última atualização:** ${new Date().toLocaleDateString('pt-BR')}

---

## 📋 Índice

1. [O que é Zod?](#o-que-é-zod)
2. [auth.schema.ts](#authschemats)
3. [user.schema.ts](#userschemats)
4. [pagination.schema.ts](#paginationschemats)
5. [Validações Avançadas](#validações-avançadas)
6. [Padrões e Boas Práticas](#padrões-e-boas-práticas)

---

## 🎯 O que é Zod?

**Zod** é uma biblioteca TypeScript para **validação de dados** e **inferência de tipos**.

### ✨ Principais Recursos

- ✅ **Type-safe**: Tipos TypeScript automáticos
- ✅ **Validação em runtime**: Verifica dados em tempo de execução
- ✅ **Mensagens de erro customizadas**: Erros descritivos
- ✅ **Composição de schemas**: Reutilização de validações
- ✅ **Transformação de dados**: Converte tipos (string → number)
- ✅ **Integração com Fastify**: Validação automática de rotas

---

## 🎯 Por que usar Zod?

### ❌ Sem Zod

```typescript
async createUser(request, reply) {
  const { name, email, password, type } = request.body;

  // Validação manual:
  if (!name || name.length < 3) {
    return reply.status(400).send({ message: "Nome inválido" });
  }

  if (!email || !email.includes("@")) {
    return reply.status(400).send({ message: "Email inválido" });
  }

  if (!password || password.length < 6) {
    return reply.status(400).send({ message: "Senha inválida" });
  }

  if (!["medico", "paciente"].includes(type)) {
    return reply.status(400).send({ message: "Tipo inválido" });
  }

  // ... criar usuário
}
```

**Problemas:**

- 😫 Código repetitivo
- 😫 Difícil de manter
- 😫 Sem type-safety
- 😫 Sem documentação automática

---

### ✅ Com Zod

```typescript
// Schema (1 vez):
const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(["medico", "paciente"]),
});

// Route (validação automática):
app.route({
  method: "POST",
  url: "/users",
  schema: {
    body: createUserSchema  // ← Validação automática!
  },
  handler: controller.createUser
});

// Controller (dados já validados):
async createUser(request, reply) {
  // request.body está validado e tipado!
  const user = await userService.createUser(request.body);
  return reply.send(user);
}
```

**Vantagens:**

- ✅ Validação automática
- ✅ Type-safety completo
- ✅ Código limpo e conciso
- ✅ Documentação Swagger automática
- ✅ Mensagens de erro descritivas

---

## 🔐 auth.schema.ts

**Localização:** `src/schemas/auth.schema.ts`  
**Responsabilidade:** Validação de login e refresh token

### 📝 Código Completo

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token é obrigatório" }),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
```

---

### 🔑 loginSchema

**Linha 3-8**

```typescript
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
});
```

#### 🔧 Análise Detalhada

| Campo      | Validação            | Mensagem de Erro                          |
| ---------- | -------------------- | ----------------------------------------- |
| `email`    | `z.string().email()` | "Email inválido"                          |
| `password` | `z.string().min(6)`  | "A senha deve ter no mínimo 6 caracteres" |

#### ✅ Exemplos Válidos

```json
// ✅ Válido:
{
  "email": "joao@email.com",
  "password": "senha123"
}

// ✅ Válido:
{
  "email": "maria.santos@empresa.com.br",
  "password": "senhaSegura123"
}
```

#### ❌ Exemplos Inválidos

```json
// ❌ Email sem @:
{
  "email": "joaoemail.com",
  "password": "senha123"
}
// Erro: "Email inválido"

// ❌ Senha muito curta:
{
  "email": "joao@email.com",
  "password": "123"
}
// Erro: "A senha deve ter no mínimo 6 caracteres"

// ❌ Faltando campo:
{
  "email": "joao@email.com"
}
// Erro: "Required" (campo obrigatório)
```

---

### 📘 Type Inference

**Linha 10**

```typescript
export type LoginInput = z.infer<typeof loginSchema>;
```

#### O que é `z.infer`?

**Extrai o tipo TypeScript** do schema Zod automaticamente.

```typescript
// Schema Zod:
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Tipo inferido:
type LoginInput = {
  email: string;
  password: string;
};

// Uso:
function login(data: LoginInput) {
  console.log(data.email); // ✅ Type-safe
  console.log(data.password); // ✅ Type-safe
  console.log(data.nome); // ❌ Erro: Property 'nome' does not exist
}
```

---

### 🔄 refreshTokenSchema

**Linha 12-14**

```typescript
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token é obrigatório" }),
});
```

#### 🔧 Análise

| Campo          | Validação           | Mensagem de Erro              |
| -------------- | ------------------- | ----------------------------- |
| `refreshToken` | `z.string().min(1)` | "Refresh token é obrigatório" |

#### ❓ Por que `min(1)` ao invés de só `string()`?

```typescript
// Sem min():
z.string(); // Aceita string vazia ""

// Com min(1):
z.string().min(1); // Rejeita string vazia ""
```

**Garante que o campo não está vazio!**

---

## 👤 user.schema.ts

**Localização:** `src/schemas/user.schema.ts`  
**Responsabilidade:** Validação de criação de usuário

### 📝 Código Completo

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  type: z.enum(["medico", "paciente"], {
    message: 'Tipo deve ser "medico" ou "paciente"',
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

---

### 📦 Campos do Schema

| Campo      | Tipo   | Validação                  | Mensagem de Erro                          |
| ---------- | ------ | -------------------------- | ----------------------------------------- |
| `name`     | string | `min(3)`                   | "Nome deve ter no mínimo 3 caracteres"    |
| `email`    | string | `email()`                  | "Email inválido"                          |
| `password` | string | `min(6)`                   | "A senha deve ter no mínimo 6 caracteres" |
| `type`     | enum   | `"medico"` ou `"paciente"` | 'Tipo deve ser "medico" ou "paciente"'    |

---

### 🎭 z.enum() - Valores Fixos

**Linha 9-11**

```typescript
type: z.enum(["medico", "paciente"], {
  message: 'Tipo deve ser "medico" ou "paciente"',
});
```

#### O que é `enum`?

**Define uma lista de valores permitidos**.

```typescript
// ✅ Válido:
{
  type: "medico";
}
{
  type: "paciente";
}

// ❌ Inválido:
{
  type: "admin";
} // Erro: 'Tipo deve ser "medico" ou "paciente"'
{
  type: "usuario";
} // Erro
{
  type: "";
} // Erro
```

#### 📘 Type Inference

```typescript
type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  type: "medico" | "paciente"; // ← Union type automático!
};

// Uso:
function test(user: CreateUserInput) {
  if (user.type === "medico") {
    // ...
  } else if (user.type === "paciente") {
    // ...
  } else {
    // ❌ TypeScript detecta que isso nunca acontece
  }
}
```

---

### ✅ Exemplos de Validação

#### ✅ Válido

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "medico"
}
```

#### ❌ Nome muito curto

```json
{
  "name": "Jo",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "medico"
}
```

**Erro:** "Nome deve ter no mínimo 3 caracteres"

#### ❌ Email inválido

```json
{
  "name": "João Silva",
  "email": "joao.email.com",
  "password": "senha123",
  "type": "medico"
}
```

**Erro:** "Email inválido"

#### ❌ Tipo inválido

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "admin"
}
```

**Erro:** 'Tipo deve ser "medico" ou "paciente"'

---

## 📄 pagination.schema.ts

**Localização:** `src/schemas/pagination.schema.ts`  
**Responsabilidade:** Validação de parâmetros de paginação

### 📝 Código Completo

```typescript
import { z } from "zod";

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "A página deve ser maior que 0" }),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "O limite deve estar entre 1 e 100",
    }),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
```

---

### 🔧 Análise Detalhada: page

**Linha 4-9**

```typescript
page: z.string()
  .optional()
  .default("1")
  .transform((val) => parseInt(val, 10))
  .refine((val) => val > 0, { message: "A página deve ser maior que 0" });
```

#### 🔗 Cadeia de Validação

| Método                                   | O que faz?                |
| ---------------------------------------- | ------------------------- |
| `.string()`                              | Aceita apenas string      |
| `.optional()`                            | Campo não é obrigatório   |
| `.default("1")`                          | Se não fornecido, usa "1" |
| `.transform((val) => parseInt(val, 10))` | Converte string → number  |
| `.refine((val) => val > 0, { ... })`     | Valida que número > 0     |

#### 📊 Exemplos

```
// Query params são sempre strings!
GET /users?page=2&limit=5

request.query = {
  page: "2",      // ← string
  limit: "5"      // ← string
}

// Após validação Zod:
{
  page: 2,        // ← number
  limit: 5        // ← number
}
```

---

### 🔧 Análise Detalhada: limit

**Linha 10-17**

```typescript
limit: z.string()
  .optional()
  .default("10")
  .transform((val) => parseInt(val, 10))
  .refine((val) => val > 0 && val <= 100, {
    message: "O limite deve estar entre 1 e 100",
  });
```

#### 🔗 Cadeia de Validação

| Método                                             | O que faz?                  |
| -------------------------------------------------- | --------------------------- |
| `.string()`                                        | Aceita apenas string        |
| `.optional()`                                      | Campo não é obrigatório     |
| `.default("10")`                                   | Se não fornecido, usa "10"  |
| `.transform((val) => parseInt(val, 10))`           | Converte string → number    |
| `.refine((val) => val > 0 && val <= 100, { ... })` | Valida que 1 ≤ número ≤ 100 |

---

### 🎯 .transform() - Transformação de Dados

```typescript
.transform((val) => parseInt(val, 10))
```

**Converte o valor** de um tipo para outro.

#### Exemplo

```typescript
// Input (string):
{
  page: "2";
}

// Após transform:
{
  page: 2;
} // ← number
```

#### Por que é necessário?

Query parameters **sempre vêm como strings**:

```
GET /users?page=2&limit=10

request.query = {
  page: "2",     // ← string, não number!
  limit: "10"    // ← string, não number!
}
```

---

### 🎯 .refine() - Validação Customizada

```typescript
.refine((val) => val > 0, { message: "A página deve ser maior que 0" })
```

**Valida com lógica customizada**.

#### Exemplos

```typescript
// ✅ Válido:
.refine((val) => val > 0)
{ page: 1 }   // ✅
{ page: 5 }   // ✅
{ page: 100 } // ✅

// ❌ Inválido:
{ page: 0 }   // ❌ "A página deve ser maior que 0"
{ page: -1 }  // ❌ "A página deve ser maior que 0"
```

```typescript
// ✅ Válido:
.refine((val) => val > 0 && val <= 100)
{ limit: 1 }   // ✅
{ limit: 50 }  // ✅
{ limit: 100 } // ✅

// ❌ Inválido:
{ limit: 0 }   // ❌ "O limite deve estar entre 1 e 100"
{ limit: 101 } // ❌ "O limite deve estar entre 1 e 100"
```

---

### ✅ Exemplos de Uso

#### ✅ Sem parâmetros (usa defaults)

```
GET /users

// Após validação:
{
  page: 1,   // default
  limit: 10  // default
}
```

#### ✅ Com parâmetros

```
GET /users?page=3&limit=20

// Após validação:
{
  page: 3,
  limit: 20
}
```

#### ❌ Página inválida

```
GET /users?page=0&limit=10

// Erro: "A página deve ser maior que 0"
```

#### ❌ Limite inválido

```
GET /users?page=1&limit=200

// Erro: "O limite deve estar entre 1 e 100"
```

---

## 🚀 Validações Avançadas

### 🔗 Composição de Schemas

```typescript
const baseUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6),
  type: z.enum(["medico", "paciente"]),
});

const updateUserSchema = baseUserSchema.partial(); // Todos os campos opcionais
```

---

### 📝 Validações Customizadas

```typescript
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Deve conter pelo menos uma letra maiúscula",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Deve conter pelo menos um número",
  })
  .refine((val) => /[!@#$%^&*]/.test(val), {
    message: "Deve conter pelo menos um caractere especial",
  });
```

---

### 🎯 Transformações Complexas

```typescript
const dateSchema = z.string()
  .transform((val) => new Date(val))
  .refine((date) => !isNaN(date.getTime()), {
    message: "Data inválida"
  });

// Input:
{ createdAt: "2024-01-15" }

// Output:
{ createdAt: Date(2024-01-15T00:00:00.000Z) }
```

---

### 🔄 Schemas Opcionais

```typescript
const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

// ✅ Todos válidos:
{}
{ name: "João" }
{ email: "joao@email.com" }
{ name: "João", email: "joao@email.com" }
```

---

### 🎭 Union Types

```typescript
const idSchema = z.union([
  z.number(), // Aceita number
  z.string(), // OU string
]);

// ✅ Válidos:
{
  id: 1;
}
{
  id: "abc-123";
}

// ❌ Inválido:
{
  id: true;
} // boolean não permitido
```

---

## 🎨 Padrões e Boas Práticas

### ✅ Padrões Utilizados

#### 1. **Sempre exportar tipo inferido**

```typescript
export const loginSchema = z.object({ ... });
export type LoginInput = z.infer<typeof loginSchema>;
```

#### 2. **Mensagens de erro descritivas**

```typescript
// ❌ RUIM:
z.string().min(6);

// ✅ BOM:
z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" });
```

#### 3. **Usar transform para conversão de tipos**

```typescript
z.string().transform((val) => parseInt(val, 10));
```

#### 4. **Usar refine para validações complexas**

```typescript
.refine((val) => val > 0 && val <= 100, {
  message: "O limite deve estar entre 1 e 100"
})
```

#### 5. **Usar enum para valores fixos**

```typescript
type: z.enum(["medico", "paciente"]);
```

---

### 📚 Tipos Comuns do Zod

| Método                | Tipo TypeScript  | Exemplo            |
| --------------------- | ---------------- | ------------------ |
| `z.string()`          | `string`         | `"texto"`          |
| `z.number()`          | `number`         | `123`              |
| `z.boolean()`         | `boolean`        | `true`             |
| `z.date()`            | `Date`           | `new Date()`       |
| `z.array(z.string())` | `string[]`       | `["a", "b"]`       |
| `z.object({ ... })`   | `{ ... }`        | `{ name: "João" }` |
| `z.enum(["a", "b"])`  | `"a" \| "b"`     | `"a"`              |
| `z.union([...])`      | `A \| B`         | `1` ou `"1"`       |
| `z.optional()`        | `T \| undefined` | `undefined`        |
| `z.nullable()`        | `T \| null`      | `null`             |

---

### 🔧 Modificadores Comuns

| Método                     | O que faz?                    |
| -------------------------- | ----------------------------- |
| `.optional()`              | Campo não é obrigatório       |
| `.nullable()`              | Aceita `null`                 |
| `.default(value)`          | Valor padrão se não fornecido |
| `.transform(fn)`           | Transforma valor              |
| `.refine(fn, { message })` | Validação customizada         |
| `.min(n)`                  | Mínimo (string/number/array)  |
| `.max(n)`                  | Máximo (string/number/array)  |
| `.email()`                 | Valida email                  |
| `.url()`                   | Valida URL                    |
| `.uuid()`                  | Valida UUID                   |

---

## 🔄 Fluxo de Validação

```
1. Frontend envia:
   POST /users
   {
     "name": "Jo",
     "email": "joao@email.com",
     "password": "senha123",
     "type": "medico"
   }
   ↓
2. Fastify recebe e aplica schema:
   body: createUserSchema
   ↓
3. Zod valida campo por campo:
   ✅ email: "joao@email.com" (válido)
   ✅ password: "senha123" (válido)
   ✅ type: "medico" (válido)
   ❌ name: "Jo" (min 3 caracteres)
   ↓
4. Zod retorna erro:
   {
     "message": "Erro de validação",
     "errors": [
       {
         "path": ["name"],
         "message": "Nome deve ter no mínimo 3 caracteres"
       }
     ]
   }
   ↓
5. Fastify envia response 400 para frontend
```

---

## 📖 Resumo

### ✅ Por que usar Zod?

- **Type-safety:** TypeScript automático
- **Validação automática:** Sem código manual
- **Mensagens de erro:** Descritivas e customizáveis
- **Documentação automática:** Swagger/OpenAPI
- **Transformação de dados:** string → number, etc
- **Composição:** Reutilização de schemas

### 📦 Schemas Principais

| Arquivo                | Responsabilidade       |
| ---------------------- | ---------------------- |
| `auth.schema.ts`       | Login e refresh token  |
| `user.schema.ts`       | Criação de usuário     |
| `pagination.schema.ts` | Paginação de listagens |

---

## 📖 Próximos Documentos

- **[03-SERVICES.md](03-SERVICES.md)** - Lógica de negócio
- **[04-CONTROLLERS.md](04-CONTROLLERS.md)** - Processamento de requisições
- **[05-ROUTES.md](05-ROUTES.md)** - Definição de endpoints
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização
- **[08-PLUGINS.md](08-PLUGINS.md)** - Configuração do Fastify

---

**[⬅️ Voltar para Routes](05-ROUTES.md)** | **[➡️ Ir para Middlewares](07-MIDDLEWARES.md)**
