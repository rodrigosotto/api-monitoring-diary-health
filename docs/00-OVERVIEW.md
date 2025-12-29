# 📚 Visão Geral do Projeto - Health Diary Monitoring API

## 🎯 Objetivo

API REST para gerenciamento e monitoramento de saúde diária para pacientes, permitindo que médicos e pacientes gerenciem informações de saúde de forma segura e escalável.

## 🏗️ Arquitetura do Projeto

```
health-diary-monitoring-api/
├── docs/                    # Documentação completa do projeto
├── prisma/                  # Schema do banco de dados (ORM)
│   └── schema.prisma       # Definição dos models (User, RefreshToken)
├── src/                     # Código-fonte da aplicação
│   ├── app.ts              # Configuração principal do Fastify
│   ├── server.ts           # Inicialização do servidor
│   ├── config/             # Configurações (variáveis de ambiente)
│   ├── controllers/        # Controladores (recebem requests, retornam responses)
│   ├── middlewares/        # Middlewares (autenticação, validação)
│   ├── plugins/            # Plugins do Fastify (Prisma, JWT, CORS, Swagger)
│   ├── routes/             # Definição de rotas e documentação Swagger
│   ├── schemas/            # Validação de dados com Zod
│   ├── services/           # Lógica de negócio (regras, acesso ao banco)
│   ├── types/              # Tipos TypeScript customizados
│   └── utils/              # Funções utilitárias (paginação)
├── .env                     # Variáveis de ambiente (não versionado)
├── docker-compose.yml       # Orquestração de containers (API + PostgreSQL)
├── Dockerfile               # Imagem Docker da aplicação
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
└── README.md                # Documentação de uso

```

## 🔧 Stack Tecnológico

### Backend Framework

- **Fastify** - Framework web de alta performance para Node.js
- **TypeScript** - Superset do JavaScript com tipagem estática

### Banco de Dados

- **PostgreSQL** - Banco de dados relacional robusto
- **Prisma ORM** - ORM moderno para TypeScript/Node.js

### Autenticação & Segurança

- **JWT (JSON Web Tokens)** - Autenticação stateless
- **Bcrypt** - Hash de senhas
- **Refresh Token** - Sistema de renovação de tokens

### Validação

- **Zod** - Validação de schemas TypeScript-first

### Documentação

- **Swagger/OpenAPI** - Documentação interativa da API
- **Scalar** - UI moderna para visualização da documentação

### DevOps

- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de containers

## 📊 Fluxo de Dados

```
Cliente (React Native)
    ↓
[Request HTTP]
    ↓
Fastify Server (app.ts)
    ↓
Middlewares (autenticação, CORS)
    ↓
Routes (validação Zod)
    ↓
Controllers (tratamento de erros)
    ↓
Services (lógica de negócio)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
[Response JSON]
    ↓
Cliente (React Native)
```

## 🔐 Sistema de Autenticação

1. **Login**: Usuário envia email e senha
2. **Validação**: Bcrypt compara hash da senha
3. **Tokens**: Sistema gera:
   - **Access Token** (JWT) - válido por 1 hora
   - **Refresh Token** (UUID) - válido por 90 dias, armazenado no banco
4. **Requisições**: Access token enviado no header `Authorization: Bearer <token>`
5. **Renovação**: Quando access token expira, usa refresh token para gerar novo
6. **Logout**: Revoga refresh token no banco de dados

## 📱 Casos de Uso

### Médicos

- Login com role "medico"
- Acesso ao dashboard de médicos
- Gerenciamento de pacientes (futuro)

### Pacientes

- Login com role "paciente"
- Acesso ao dashboard de pacientes
- Registro de informações de saúde (futuro)

## 🌐 Endpoints Principais

- `POST /login` - Autenticação
- `POST /refresh` - Renovar token
- `POST /logout` - Sair
- `POST /users` - Criar usuário
- `GET /users` - Listar usuários (com paginação)
- `GET /profile` - Ver perfil autenticado
- `GET /doctors/dashboard` - Dashboard médico (protegido)
- `GET /patients/dashboard` - Dashboard paciente (protegido)

## 🔄 Ciclo de Desenvolvimento

1. **Desenvolvimento Local**: `npm run dev` - Roda com hot reload
2. **Migrations**: `npm run migrate` - Sincroniza schema com banco
3. **Build**: `npm run build` - Compila TypeScript para JavaScript
4. **Produção**: `npm start` - Roda versão compilada
5. **Docker**: `docker-compose up` - Sobe API + PostgreSQL

## 📖 Próximas Seções

- [01-TECNOLOGIAS.md](./01-TECNOLOGIAS.md) - Detalhes sobre cada tecnologia
- [02-ESTRUTURA-PASTAS.md](./02-ESTRUTURA-PASTAS.md) - Explicação detalhada da estrutura
- [03-ARQUIVOS-RAIZ.md](./03-ARQUIVOS-RAIZ.md) - Arquivos de configuração
- [04-SERVICES.md](./04-SERVICES.md) - Lógica de negócio
- [05-CONTROLLERS.md](./05-CONTROLLERS.md) - Controladores
- [06-ROUTES.md](./06-ROUTES.md) - Rotas e documentação Swagger
- [07-SCHEMAS.md](./07-SCHEMAS.md) - Validação com Zod
- [08-MIDDLEWARES.md](./08-MIDDLEWARES.md) - Autenticação e autorização
- [09-PLUGINS.md](./09-PLUGINS.md) - Plugins do Fastify
- [10-COMANDOS.md](./10-COMANDOS.md) - Guia de comandos essenciais
