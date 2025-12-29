# 🛣️ Referência Completa de Endpoints

> **Lista completa de todos os endpoints disponíveis na API**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Usuários](#usuários)
4. [Dashboards](#dashboards)
5. [Códigos de Status HTTP](#códigos-de-status-http)

---

## 🎯 Visão Geral

**Base URL:** `http://localhost:3000`  
**Documentação Interativa:** http://localhost:3000/docs

| Categoria        | Endpoints | Autenticação |
| ---------------- | --------- | ------------ |
| **Health Check** | 1         | Não          |
| **Autenticação** | 4         | Não / Sim    |
| **Usuários**     | 3         | Não / Sim    |
| **Dashboards**   | 2         | Sim          |

**Total:** 10 endpoints

---

## 🏥 Health Check

### GET /

**Descrição:** Verifica se a API está rodando

**Autenticação:** Não requerida

**Request:**

```bash
curl http://localhost:3000
```

**Response (200):**

```json
{
  "message": "Health Diary Monitoring API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

## 🔐 Autenticação

### POST /login

**Descrição:** Realizar login na aplicação

**Autenticação:** Não requerida

**Body:**

```json
{
  "email": "string (email válido)",
  "password": "string (min 6 caracteres)"
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

**Response (200):**

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

**Response (401):**

```json
{
  "message": "Credenciais inválidas"
}
```

---

### POST /refresh

**Descrição:** Renovar access token usando refresh token

**Autenticação:** Não requerida

**Body:**

```json
{
  "refreshToken": "string (token obtido no login)"
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a3f7b2c1d4e5f6g7h8i9j0k1l2m3n4o5..."
  }'
```

**Response (200):**

```json
{
  "message": "Token renovado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Response (401):**

```json
{
  "message": "Refresh token inválido ou expirado"
}
```

---

### POST /logout

**Descrição:** Fazer logout e revogar refresh token

**Autenticação:** Não requerida

**Body:**

```json
{
  "refreshToken": "string"
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a3f7b2c1d4e5f6g7h8i9j0k1l2m3n4o5..."
  }'
```

**Response (200):**

```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### POST /logout-all

**Descrição:** Fazer logout de todos os dispositivos

**Autenticação:** 🔒 Bearer Token (JWT)

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request:**

```bash
curl -X POST http://localhost:3000/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "message": "Logout realizado em todos os dispositivos"
}
```

**Response (401):**

```json
{
  "message": "Token inválido ou ausente"
}
```

---

## 👤 Usuários

### POST /users

**Descrição:** Criar novo usuário (registro)

**Autenticação:** Não requerida

**Body:**

```json
{
  "name": "string (min 3 caracteres)",
  "email": "string (email válido)",
  "password": "string (min 6 caracteres)",
  "type": "medico | paciente"
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "type": "medico"
  }'
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

**Response (400):**

```json
{
  "message": "Email já está em uso"
}
```

---

### GET /users

**Descrição:** Listar todos os usuários com paginação

**Autenticação:** Não requerida

**Query Parameters:**

| Parâmetro | Tipo   | Obrigatório | Default | Validação |
| --------- | ------ | ----------- | ------- | --------- |
| `page`    | number | Não         | 1       | > 0       |
| `limit`   | number | Não         | 10      | 1-100     |

**Request:**

```bash
# Sem parâmetros (usa defaults):
curl http://localhost:3000/users

# Com paginação:
curl "http://localhost:3000/users?page=2&limit=5"
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "type": "medico",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Maria Santos",
      "email": "maria@email.com",
      "type": "paciente",
      "createdAt": "2024-01-14T15:20:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### GET /profile

**Descrição:** Ver perfil do usuário autenticado

**Autenticação:** 🔒 Bearer Token (JWT)

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request:**

```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

**Response (401):**

```json
{
  "message": "Token inválido ou ausente"
}
```

**Response (404):**

```json
{
  "message": "Usuário não encontrado"
}
```

---

## 📊 Dashboards

### GET /dashboard/medico

**Descrição:** Dashboard exclusivo para médicos

**Autenticação:** 🔒 Bearer Token (JWT) + Role: `medico`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request:**

```bash
curl http://localhost:3000/dashboard/medico \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "message": "Dashboard do médico",
  "data": {
    "totalPacientes": 150,
    "consultas": 45,
    "proximasConsultas": [
      {
        "id": 1,
        "paciente": "Maria Santos",
        "data": "2024-01-20T14:00:00.000Z"
      }
    ]
  }
}
```

**Response (401):**

```json
{
  "message": "Token inválido ou ausente"
}
```

**Response (403):**

```json
{
  "message": "Acesso negado. Você não tem permissão para acessar este recurso."
}
```

---

### GET /dashboard/paciente

**Descrição:** Dashboard exclusivo para pacientes

**Autenticação:** 🔒 Bearer Token (JWT) + Role: `paciente`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Request:**

```bash
curl http://localhost:3000/dashboard/paciente \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**

```json
{
  "message": "Dashboard do paciente",
  "data": {
    "proximasConsultas": [
      {
        "id": 1,
        "medico": "Dr. João Silva",
        "data": "2024-01-20T14:00:00.000Z"
      }
    ],
    "historico": []
  }
}
```

**Response (401):**

```json
{
  "message": "Token inválido ou ausente"
}
```

**Response (403):**

```json
{
  "message": "Acesso negado. Você não tem permissão para acessar este recurso."
}
```

---

## 📊 Códigos de Status HTTP

| Status  | Nome                  | Significado       | Quando ocorre                            |
| ------- | --------------------- | ----------------- | ---------------------------------------- |
| **200** | OK                    | Sucesso           | Operação bem-sucedida (GET, PUT, DELETE) |
| **201** | Created               | Recurso criado    | POST bem-sucedido (criar usuário)        |
| **400** | Bad Request           | Erro de validação | Dados inválidos, email já existe         |
| **401** | Unauthorized          | Não autenticado   | Token ausente, inválido ou expirado      |
| **403** | Forbidden             | Sem permissão     | Autenticado mas sem role necessário      |
| **404** | Not Found             | Não encontrado    | Recurso não existe no banco              |
| **500** | Internal Server Error | Erro interno      | Erro inesperado no servidor              |

---

## 🔐 Autenticação

### Como Autenticar Requisições

1. **Fazer login:**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "...", "password": "..." }'
```

2. **Copiar accessToken da resposta**

3. **Usar em requisições protegidas:**

```bash
curl http://localhost:3000/profile \
  -H "Authorization: Bearer <accessToken>"
```

---

### Access Token vs Refresh Token

|             | **Access Token**                | **Refresh Token**                 |
| ----------- | ------------------------------- | --------------------------------- |
| **Duração** | 1 hora                          | 90 dias                           |
| **Uso**     | Todas as requisições            | Apenas endpoint /refresh          |
| **Formato** | JWT                             | String aleatória                  |
| **Header**  | `Authorization: Bearer <token>` | Body: `{ "refreshToken": "..." }` |

---

### Fluxo de Tokens

```
1. Login:
   POST /login
   ↓
   Retorna: accessToken (1h) + refreshToken (90 dias)

2. Usar accessToken em requisições:
   GET /profile
   Authorization: Bearer <accessToken>

3. Access token expira (após 1h):
   ❌ GET /profile → 401 Unauthorized

4. Renovar access token:
   POST /refresh
   { "refreshToken": "..." }
   ↓
   Retorna: NOVO accessToken (1h)

5. Usar novo access token:
   GET /profile
   Authorization: Bearer <novoAccessToken>
```

---

## 📝 Exemplos Práticos

### Fluxo Completo de Autenticação

```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "type": "medico"
  }'

# 2. Fazer login
LOGIN_RESPONSE=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }')

# 3. Extrair accessToken
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

# 4. Acessar perfil
curl http://localhost:3000/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Acessar dashboard de médico
curl http://localhost:3000/dashboard/medico \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Testar Paginação

```bash
# Página 1, 10 itens (default):
curl http://localhost:3000/users

# Página 2, 5 itens:
curl "http://localhost:3000/users?page=2&limit=5"

# Página 1, 20 itens:
curl "http://localhost:3000/users?page=1&limit=20"
```

---

### Testar Erros de Validação

```bash
# Email inválido:
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "email-invalido",
    "password": "senha123",
    "type": "medico"
  }'
# Response: { "message": "Email inválido" }

# Senha muito curta:
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "joao@email.com",
    "password": "123",
    "type": "medico"
  }'
# Response: { "message": "A senha deve ter no mínimo 6 caracteres" }

# Tipo inválido:
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "joao@email.com",
    "password": "senha123",
    "type": "admin"
  }'
# Response: { "message": "Tipo deve ser 'medico' ou 'paciente'" }
```

---

## 🔍 Testando Autorização

### Médico acessando dashboard de paciente (❌ Bloqueado)

```bash
# Login como médico:
MEDICO_TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "medico@email.com", "password": "senha123" }' \
  | jq -r '.accessToken')

# Tentar acessar dashboard de paciente:
curl http://localhost:3000/dashboard/paciente \
  -H "Authorization: Bearer $MEDICO_TOKEN"

# Response (403):
# {
#   "message": "Acesso negado. Você não tem permissão para acessar este recurso."
# }
```

---

## 📚 Recursos Relacionados

- **[05-ROUTES.md](05-ROUTES.md)** - Documentação detalhada das rotas
- **[06-SCHEMAS.md](06-SCHEMAS.md)** - Schemas de validação
- **[07-MIDDLEWARES.md](07-MIDDLEWARES.md)** - Autenticação e autorização
- **[QUICK-START.md](QUICK-START.md)** - Guia de início rápido

---

**[⬅️ Voltar para README](../README.md)** | **[📚 Ver Documentação Completa](README.md)**
