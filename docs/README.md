# 📚 Índice Geral da Documentação

> **Documentação completa do projeto Health Diary Monitoring API**

---

## 🎯 Guias Principais

### 📖 [00-OVERVIEW.md](00-OVERVIEW.md)

**Visão Geral do Projeto**

- O que é o projeto
- Arquitetura geral
- Tecnologias utilizadas
- Casos de uso
- Como navegar na documentação

---

### 🛠️ [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md)

**Tecnologias Detalhadas**

- **Prisma ORM:** O que é, comandos, como funciona
- **Zod:** Validação de schemas, exemplos práticos
- **Docker:** Containerização, Dockerfile vs docker-compose
- **Fastify:** Framework web, por que usar
- **JWT:** Autenticação, access e refresh tokens
- **Bcrypt:** Hash de senhas
- **TypeScript:** Tipagem estática

---

### 📁 [02-ESTRUTURA-PASTAS.md](02-ESTRUTURA-PASTAS.md)

**Organização do Código**

- Estrutura de pastas completa
- Responsabilidade de cada diretório
- Fluxo de uma requisição
- Princípios de organização
- Onde adicionar novos arquivos

---

### 💻 [10-COMANDOS.md](10-COMANDOS.md)

**Referência de Comandos**

- **npm:** Instalação, desenvolvimento, build
- **Prisma:** Generate, migrate, studio, seed
- **Docker:** Build, up, down, logs
- **cURL:** Testar endpoints
- **Git:** Workflow completo
- Troubleshooting comum

---

## 📦 Camadas da Aplicação

### 🔄 [03-SERVICES.md](03-SERVICES.md)

**Lógica de Negócio**

- O que são Services
- **auth.service.ts:**
  - `login()` - Validar credenciais
  - `generateRefreshToken()` - Criar refresh token
  - `validateRefreshToken()` - Validar refresh token
  - `revokeRefreshToken()` - Revogar token
  - `revokeAllUserTokens()` - Logout de todos dispositivos
  - `cleanExpiredTokens()` - Limpar tokens expirados
- **user.service.ts:**
  - `createUser()` - Criar usuário com hash de senha
  - `getAllUsers()` - Listar com paginação
  - `getUserById()` - Buscar por ID

---

### 🎮 [04-CONTROLLERS.md](04-CONTROLLERS.md)

**Processamento de Requisições**

- O que são Controllers
- **auth.controller.ts:**
  - `login()` - Processar login e gerar tokens
  - `refresh()` - Renovar access token
  - `logout()` - Revogar refresh token
  - `logoutAll()` - Logout de todos dispositivos
- **user.controller.ts:**
  - `createUser()` - Criar novo usuário
  - `getAllUsers()` - Listar com paginação
  - `getProfile()` - Ver perfil do usuário autenticado

---

### 🛣️ [05-ROUTES.md](05-ROUTES.md)

**Definição de Endpoints**

- O que são Routes
- **auth.routes.ts:**
  - `POST /login` - Fazer login
  - `POST /refresh` - Renovar token
  - `POST /logout` - Fazer logout
  - `POST /logout-all` - Logout global (protegida)
- **user.routes.ts:**
  - `POST /users` - Criar usuário
  - `GET /users` - Listar com paginação
  - `GET /profile` - Ver perfil (protegida)

- Swagger/OpenAPI documentation
- Como testar endpoints

---

### ✅ [06-SCHEMAS.md](06-SCHEMAS.md)

**Validação com Zod**

- O que é Zod e por que usar
- **auth.schema.ts:**
  - `loginSchema` - Email e password
  - `refreshTokenSchema` - Refresh token
- **user.schema.ts:**
  - `createUserSchema` - Name, email, password, type
- **pagination.schema.ts:**
  - `paginationSchema` - Page e limit com transforms

- Validações avançadas
- Type inference
- Transformações de dados

---

### 🛡️ [07-MIDDLEWARES.md](07-MIDDLEWARES.md)

**Autenticação e Autorização**

- O que são Middlewares
- **auth.middleware.ts:**
  - `authenticate()` - Verificar JWT token
  - `checkRole()` - Verificar permissão (role)
- Diferença entre 401 e 403
- Como usar em rotas
- Fluxo de autenticação/autorização

---

### 🔌 [08-PLUGINS.md](08-PLUGINS.md)

**Configuração do Fastify**

- O que são Plugins
- **prisma.ts:**
  - Configurar Prisma Client
  - Hook onClose para cleanup
- **jwt.ts:**
  - Configurar fastify-jwt
  - Adicionar middleware authenticate
- **cors.ts:**
  - Configurar CORS
  - Dev vs Produção
- **swagger.ts:**
  - Configurar OpenAPI
  - Security schemes
  - Tags e documentação

---

## 📂 Arquivos por Tipo

### 🗄️ Banco de Dados

- **prisma/schema.prisma**
  - Model User (id, name, email, password, type)
  - Model RefreshToken (id, token, userId, expiresAt, revoked)
  - Relações e indexes

---

### ⚙️ Configuração

- **src/config/env.ts**
  - Variáveis de ambiente
  - NODE_ENV, PORT, JWT_SECRET, DATABASE_URL
- **docker-compose.yml**
  - Serviço PostgreSQL
  - Serviço API
  - Networks e volumes
- **Dockerfile**
  - Multi-stage build
  - Instalação de dependências
  - Build e produção
- **tsconfig.json**
  - Configuração TypeScript
  - Target ES2020, module ESNext
  - Strict mode

---

### 📦 Utilitários

- **src/utils/pagination.ts**
  - `calculatePagination()` - Calcular skip/take
  - `createPaginationMeta()` - Criar metadados
  - `createPaginatedResponse()` - Formatar resposta

---

### 🔧 Arquivos Raiz

- **package.json**
  - Dependências e scripts
  - Scripts: dev, build, start, generate
- **README.md**
  - Visão geral
  - Instalação
  - Comandos principais

---

## 🎓 Como Usar Esta Documentação

### 🆕 Iniciando no Projeto

1. Leia [00-OVERVIEW.md](00-OVERVIEW.md) para entender a arquitetura
2. Siga [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md) para aprender as tecnologias
3. Entenda [02-ESTRUTURA-PASTAS.md](02-ESTRUTURA-PASTAS.md) para navegar no código
4. Use [10-COMANDOS.md](10-COMANDOS.md) para rodar o projeto

---

### 🔍 Pesquisando Funcionalidades

#### "Como funciona o login?"

→ [03-SERVICES.md](03-SERVICES.md#método-login) + [04-CONTROLLERS.md](04-CONTROLLERS.md#método-login)

#### "Como criar uma nova rota?"

→ [05-ROUTES.md](05-ROUTES.md) + [06-SCHEMAS.md](06-SCHEMAS.md)

#### "Como proteger uma rota?"

→ [07-MIDDLEWARES.md](07-MIDDLEWARES.md#função-authenticate)

#### "Como funciona o Prisma?"

→ [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md#prisma-orm) + [08-PLUGINS.md](08-PLUGINS.md#prismats)

#### "Quais comandos usar?"

→ [10-COMANDOS.md](10-COMANDOS.md)

---

### 🛠️ Adicionando Novas Funcionalidades

#### Novo Endpoint

1. **Schema:** [06-SCHEMAS.md](06-SCHEMAS.md) - Criar validação Zod
2. **Service:** [03-SERVICES.md](03-SERVICES.md) - Adicionar lógica de negócio
3. **Controller:** [04-CONTROLLERS.md](04-CONTROLLERS.md) - Processar request/response
4. **Route:** [05-ROUTES.md](05-ROUTES.md) - Definir URL e método HTTP

---

#### Nova Tabela no Banco

1. **Prisma Schema:** [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md#comandos-prisma)
2. **Migration:** `npx prisma migrate dev --name nome_da_migration`
3. **Generate:** `npm run generate`

---

#### Novo Plugin

1. **Criar plugin:** [08-PLUGINS.md](08-PLUGINS.md#padrões-e-boas-práticas)
2. **Registrar em app.ts:** Na ordem correta

---

## 📊 Fluxo de uma Requisição

```
1. Frontend envia requisição:
   POST /login { email, password }
   ↓
2. CORS Plugin valida origem
   ↓
3. Route encontra endpoint:
   url: "/login", method: "POST"
   ↓
4. Zod valida request.body:
   [06-SCHEMAS.md] loginSchema
   ↓
5. Middlewares executam (se houver):
   [07-MIDDLEWARES.md] authenticate()
   ↓
6. Controller processa:
   [04-CONTROLLERS.md] authController.login()
   ↓
7. Service executa lógica:
   [03-SERVICES.md] authService.login()
   ↓
8. Prisma acessa banco:
   [08-PLUGINS.md] fastify.prisma.user.findUnique()
   ↓
9. Response retorna para frontend
```

---

## 🔍 Mapa de Dependências

```
app.ts
  ├─ Plugins
  │   ├─ cors.ts
  │   ├─ prisma.ts
  │   ├─ jwt.ts
  │   └─ swagger.ts
  │
  ├─ Routes
  │   ├─ auth.routes.ts
  │   │   ├─ Schemas (auth.schema.ts)
  │   │   └─ Controller (auth.controller.ts)
  │   │       └─ Service (auth.service.ts)
  │   │           └─ Prisma
  │   │
  │   └─ user.routes.ts
  │       ├─ Schemas (user.schema.ts, pagination.schema.ts)
  │       └─ Controller (user.controller.ts)
  │           └─ Service (user.service.ts)
  │               └─ Prisma
  │
  └─ Middlewares
      └─ auth.middleware.ts
```

---

## 📚 Recursos Adicionais

### 🔗 Links Úteis

- **Fastify:** https://fastify.dev
- **Prisma:** https://prisma.io/docs
- **Zod:** https://zod.dev
- **JWT:** https://jwt.io
- **Docker:** https://docs.docker.com

---

### 💡 Dicas

- Use **Swagger UI** em `/docs` para testar endpoints
- Use **Prisma Studio** (`npm run studio`) para visualizar banco
- Use **Docker logs** (`docker-compose logs -f api`) para debug
- Recarregue **VS Code** após mudanças no Prisma schema

---

## 🆘 Ajuda Rápida

| Problema                         | Solução                                               |
| -------------------------------- | ----------------------------------------------------- |
| Erro de conexão com banco        | Verifique se Docker está rodando: `docker-compose ps` |
| Prisma Client não atualizado     | Execute: `npm run generate`                           |
| TypeScript com erros após Prisma | Recarregue VS Code: `Ctrl+Shift+P` → "Reload Window"  |
| Access token expirado            | Use endpoint `/refresh` com refresh token             |
| Erro CORS                        | Verifique configuração em `cors.ts`                   |
| Swagger não carrega              | Verifique se plugins estão na ordem correta           |

---

## 📖 Ordem de Leitura Recomendada

### 🆕 Para Iniciantes

1. [00-OVERVIEW.md](00-OVERVIEW.md) - Entenda o projeto
2. [10-COMANDOS.md](10-COMANDOS.md) - Rode o projeto
3. [02-ESTRUTURA-PASTAS.md](02-ESTRUTURA-PASTAS.md) - Navegue no código
4. [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md) - Aprenda as tecnologias

### 🔧 Para Desenvolvedores

1. [05-ROUTES.md](05-ROUTES.md) - Entenda os endpoints
2. [06-SCHEMAS.md](06-SCHEMAS.md) - Aprenda validação
3. [04-CONTROLLERS.md](04-CONTROLLERS.md) - Processar requisições
4. [03-SERVICES.md](03-SERVICES.md) - Lógica de negócio
5. [07-MIDDLEWARES.md](07-MIDDLEWARES.md) - Autenticação
6. [08-PLUGINS.md](08-PLUGINS.md) - Configuração

### 🚀 Para DevOps

1. [10-COMANDOS.md](10-COMANDOS.md#docker) - Docker commands
2. [01-TECNOLOGIAS.md](01-TECNOLOGIAS.md#docker) - Docker detalhado
3. [08-PLUGINS.md](08-PLUGINS.md#ordem-de-registro) - Ordem de inicialização

---

**Documentação criada com ❤️ para facilitar o desenvolvimento**

**[🏠 Voltar para README](../README.md)**
