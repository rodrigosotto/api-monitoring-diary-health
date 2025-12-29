# 🚀 Guia de Início Rápido (Quick Start)

> **Coloque o projeto rodando em 5 minutos!**

---

## ⚡ Passo a Passo

### 1️⃣ Pré-requisitos

Certifique-se de ter instalado:

- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- ✅ Git ([Download](https://git-scm.com))

**Verificar instalação:**

```bash
node --version  # v18.0.0 ou superior
docker --version  # Docker version 20.10.0 ou superior
git --version  # git version 2.30.0 ou superior
```

---

### 2️⃣ Clonar o Projeto

```bash
git clone <url-do-repositorio>
cd health-diary-monitoring-api
```

---

### 3️⃣ Instalar Dependências

```bash
npm install
```

**Aguarde a instalação de ~150 pacotes (1-2 minutos)**

---

### 4️⃣ Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```bash
# Linux/Mac:
cp .env.example .env

# Windows:
copy .env.example .env
```

**Ou crie manualmente com o conteúdo:**

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/health_diary_db
```

⚠️ **Importante:** Mude `JWT_SECRET` para um valor único em produção!

---

### 5️⃣ Subir o Banco de Dados (PostgreSQL)

```bash
docker-compose up -d postgres-db
```

**Verificar se está rodando:**

```bash
docker-compose ps
```

**Deve mostrar:**

```
NAME                  STATUS
postgres-db           Up 5 seconds
```

---

### 6️⃣ Criar Banco de Dados e Tabelas

```bash
npm run migrate
```

**Isso vai:**

- Criar banco `health_diary_db`
- Criar tabelas `user` e `refresh_token`
- Aplicar todas as migrations

---

### 7️⃣ Gerar Prisma Client

```bash
npm run generate
```

**Isso vai:**

- Gerar código TypeScript do Prisma
- Permitir acessar `prisma.user`, `prisma.refreshToken`

---

### 8️⃣ Rodar o Servidor

```bash
npm run dev
```

**Você deve ver:**

```
🚀 Servidor rodando em: http://localhost:3000
📚 Documentação disponível em: http://localhost:3000/docs
```

---

## ✅ Testar se Está Funcionando

### 1. Testar Health Check

Abra no navegador: http://localhost:3000

**Deve retornar:**

```json
{
  "message": "Health Diary Monitoring API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

### 2. Acessar Documentação Swagger

Abra no navegador: http://localhost:3000/docs

**Deve mostrar:**

- Interface Swagger/Scalar
- Lista de todos os endpoints
- Botão "Try it out" para testar

---

### 3. Criar um Usuário

**Pelo Swagger:**

1. Abra http://localhost:3000/docs
2. Encontre **POST /users**
3. Clique em "Try it out"
4. Preencha:

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "type": "medico"
}
```

5. Clique em "Execute"
6. Deve retornar **201 Created**

---

**Pelo cURL:**

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

---

### 4. Fazer Login

**Pelo Swagger:**

1. Encontre **POST /login**
2. Clique em "Try it out"
3. Preencha:

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

4. Clique em "Execute"
5. **Copie o accessToken** da resposta

---

**Pelo cURL:**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "senha123"
  }'
```

**Response:**

```json
{
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a3f7b2c1d4e5f6g7...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "type": "medico"
  }
}
```

---

### 5. Acessar Rota Protegida (Profile)

**Pelo Swagger:**

1. Clique no botão **🔓 Authorize** (topo da página)
2. Cole o accessToken
3. Clique em "Authorize"
4. Encontre **GET /profile**
5. Clique em "Try it out"
6. Clique em "Execute"
7. Deve retornar **200 OK** com seus dados

---

**Pelo cURL:**

```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

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

## 🎉 Pronto!

Seu projeto está rodando! Agora você pode:

- 📚 **Explorar Swagger:** http://localhost:3000/docs
- 🗄️ **Visualizar banco:** `npm run studio` (abre Prisma Studio)
- 📖 **Ler documentação:** [docs/](docs/)

---

## 🔄 Comandos Úteis

```bash
# Desenvolvimento com hot reload:
npm run dev

# Rodar migrations:
npm run migrate

# Gerar Prisma Client:
npm run generate

# Abrir Prisma Studio (visualizar banco):
npm run studio

# Parar containers Docker:
docker-compose down

# Ver logs do Docker:
docker-compose logs -f api
docker-compose logs -f postgres-db

# Build para produção:
npm run build

# Rodar produção:
npm start
```

---

## ❌ Problemas Comuns

### Erro: "Port 5432 already in use"

**Solução:** Outro PostgreSQL está rodando. Pare-o:

```bash
# Linux/Mac:
sudo service postgresql stop

# Windows:
# Services → PostgreSQL → Stop
```

---

### Erro: "Cannot find module '@prisma/client'"

**Solução:** Gere o Prisma Client:

```bash
npm run generate
```

---

### Erro: "Database does not exist"

**Solução:** Rode as migrations:

```bash
npm run migrate
```

---

### Erro: "JWT_SECRET is not defined"

**Solução:** Configure o arquivo `.env`:

```env
JWT_SECRET=seu-secret-aqui
```

---

### Docker não está rodando

**Solução:** Abra Docker Desktop e aguarde iniciar.

---

## 📖 Próximos Passos

1. **Entenda a arquitetura:** [docs/00-OVERVIEW.md](docs/00-OVERVIEW.md)
2. **Aprenda as tecnologias:** [docs/01-TECNOLOGIAS.md](docs/01-TECNOLOGIAS.md)
3. **Explore a estrutura:** [docs/02-ESTRUTURA-PASTAS.md](docs/02-ESTRUTURA-PASTAS.md)
4. **Veja todos os comandos:** [docs/10-COMANDOS.md](docs/10-COMANDOS.md)

---

## 🆘 Precisa de Ajuda?

- 📚 **Documentação completa:** [docs/README.md](docs/README.md)
- 🔍 **Troubleshooting:** [docs/10-COMANDOS.md#troubleshooting](docs/10-COMANDOS.md#troubleshooting)

---

**[⬅️ Voltar para README](../README.md)** | **[📚 Ver Documentação Completa](README.md)**
