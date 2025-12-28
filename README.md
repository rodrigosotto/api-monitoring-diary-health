# API Monitoring Diary Health 🏥

API REST para gerenciamento e monitoramento de saúde diária para pacientes, construída com Fastify, Prisma ORM e PostgreSQL.

## 🚀 Tecnologias

- **Fastify** - Framework web de alta performance
- **Prisma ORM** - ORM moderno para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas TypeScript-first
- **JWT** - Autenticação via tokens
- **Docker** - Containerização da aplicação
- **Swagger/Scalar** - Documentação interativa da API

## ✨ Funcionalidades

- ✅ Autenticação JWT com Refresh Token
- ✅ Access token (1h) + Refresh token (90 dias)
- ✅ CRUD de usuários
- ✅ Rotas protegidas com middleware
- ✅ Controle de acesso baseado em roles (médico/paciente)
- ✅ Validação de dados com Zod
- ✅ Documentação interativa (Swagger UI)
- ✅ Logout e revogação de tokens
- ✅ Arquitetura modular e escalável

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🔧 Instalação e Configuração

### 1️⃣ Clone o repositório

```bash
git clone <seu-repositorio>
cd api-monitoring-diary-health
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
DATABASE_URL="postgresql://seunome:000000@postgres:5432/medicaldb?schema=public"
```

### 4️⃣ Suba o banco de dados com Docker

```bash
docker-compose up -d postgres
```

### 5️⃣ Execute as migrations do Prisma

```bash
npm run migrate
```

### 6️⃣ Inicie a aplicação

**Modo desenvolvimento (local):**

```bash
npm run dev
```

**Modo Docker (produção):**

```bash
docker-compose up -d
```

## 📚 Acessando a Documentação

Após iniciar a aplicação, acesse a documentação interativa:

```
http://localhost:3000/docs
```

## 🔐 Testando a API

### 1. Criar um usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. João Silva",
    "email": "joao@medical.com",
    "password": "senha123",
    "type": "medico"
  }'
```

### 2. Fazer login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@medical.com",
    "password": "senha123"
  }'
```

**Resposta:**

```json
{
  "message": "Login realizado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "Dr. João Silva",
    "email": "joao@medical.com",
    "type": "medico"
  }
}
```

### 3. Acessar rota protegida

```bash
# Salvar os tokens
ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@medical.com","password":"senha123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# Usar o access token para acessar o dashboard
curl -X GET http://localhost:3000/doctors/dashboard \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 4. Renovar access token (quando expirar)

```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu_refresh_token_aqui"
  }'
```

### 5. Fazer logout

```bash
curl -X POST http://localhost:3000/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu_refresh_token_aqui"
  }'
```

## 📁 Estrutura do Projeto

```
api-monitoring-diary-health/
├── src/
│   ├── config/           # Configurações (env, swagger)
│   ├── plugins/          # Plugins do Fastify (prisma, jwt, cors)
│   ├── middlewares/      # Middlewares (authenticate, checkRole)
│   ├── schemas/          # Validações Zod
│   ├── services/         # Lógica de negócio
│   ├── controllers/      # Handlers de requisições
│   ├── routes/           # Definição de rotas
│   ├── app.ts            # Ponto de entrada
│   └── server.ts         # Configuração do servidor
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
├── docker-compose.yml    # Configuração Docker
├── Dockerfile            # Build da aplicação
└── package.json
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev        # Inicia em modo desenvolvimento
npm run build      # Compila o TypeScript
npm start          # Inicia a aplicação compilada
npm run migrate    # Executa migrations do Prisma
npm run generate   # Gera o Prisma Client
npm run lint       # Executa o linter
npm test           # Executa os testes
```

## 🐳 Docker

### Subir toda a aplicação (API + Banco):

```bash
docker-compose up -d
```

### Rebuild completo:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Ver logs:

```bash
docker-compose logs -f api
```

### Parar containers:

```bash
docker-compose down
```

## 📖 Endpoints Principais

### Autenticação

| Método | Endpoint      | Descrição                        | Autenticação |
| ------ | ------------- | -------------------------------- | ------------ |
| POST   | `/login`      | Login (retorna access + refresh) | ❌           |
| POST   | `/refresh`    | Renovar access token             | ❌           |
| POST   | `/logout`     | Logout (revoga refresh token)    | ❌           |
| POST   | `/logout-all` | Logout de todos os dispositivos  | ✅           |

### Usuários

| Método | Endpoint   | Descrição        | Autenticação |
| ------ | ---------- | ---------------- | ------------ |
| POST   | `/users`   | Criar usuário    | ❌           |
| GET    | `/users`   | Listar usuários  | ❌           |
| GET    | `/profile` | Ver perfil       | ✅           |
| PUT    | `/profile` | Atualizar perfil | ✅           |

### Dashboards

| Método | Endpoint              | Descrição          | Autenticação        |
| ------ | --------------------- | ------------------ | ------------------- |
| GET    | `/doctors/dashboard`  | Dashboard médico   | ✅ (role: medico)   |
| GET    | `/patients/dashboard` | Dashboard paciente | ✅ (role: paciente) |

## 🔒 Autenticação

A API usa **JWT (JSON Web Tokens)** com sistema de **Refresh Token** para autenticação segura.

### Como funciona:

1. **Login inicial** (`/login`):
   - Envie email e senha
   - Receba `accessToken` (válido por 1 hora) e `refreshToken` (válido por 90 dias)

2. **Fazer requisições**:
   - Use o `accessToken` no header: `Authorization: Bearer <accessToken>`

3. **Quando o access token expirar**:
   - Chame `/refresh` com o `refreshToken`
   - Receba um novo `accessToken`
   - Continue usando a API normalmente

4. **Logout**:
   - `/logout` - Revoga um refresh token específico
   - `/logout-all` - Revoga todos os tokens do usuário (deslogar de todos dispositivos)

### Fluxo para aplicações mobile (React Native):

```typescript
// 1. Login
const { accessToken, refreshToken } = await login();
await AsyncStorage.setItem("@accessToken", accessToken);
await AsyncStorage.setItem("@refreshToken", refreshToken);

// 2. Fazer requisições
axios.defaults.headers.Authorization = `Bearer ${accessToken}`;

// 3. Interceptor para renovar token automaticamente
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem("@refreshToken");
      const { accessToken } = await refresh(refreshToken);
      await AsyncStorage.setItem("@accessToken", accessToken);
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

## 👥 Roles e Permissões

- **medico**: Acesso ao dashboard de médicos
- **paciente**: Acesso ao dashboard de pacientes

## 📝 Licença

ISC

## 👨‍💻 Autor

Jefferson Sotto
