# 📂 Estrutura de Pastas Detalhada

## 🌳 Árvore Completa

```
health-diary-monitoring-api/
├── docs/                           # 📚 Documentação do projeto
│   ├── 00-OVERVIEW.md             # Visão geral
│   ├── 01-TECNOLOGIAS.md          # Tecnologias usadas
│   ├── 02-ESTRUTURA-PASTAS.md     # Este arquivo
│   └── ...                         # Outras documentações
│
├── prisma/                         # 🗄️ Prisma ORM
│   ├── schema.prisma              # Schema do banco (models, relations)
│   └── migrations/                # Histórico de migrations
│       └── 20241229_add_refresh_tokens/
│           └── migration.sql      # SQL gerado automaticamente
│
├── src/                            # 💻 Código-fonte
│   ├── app.ts                     # ⚙️ Configuração do Fastify
│   ├── server.ts                  # 🚀 Inicialização do servidor
│   │
│   ├── config/                    # 📝 Configurações
│   │   └── env.ts                 # Variáveis de ambiente tipadas
│   │
│   ├── controllers/               # 🎮 Controladores
│   │   ├── auth.controller.ts    # Login, refresh, logout
│   │   └── user.controller.ts    # CRUD de usuários
│   │
│   ├── middlewares/               # 🛡️ Middlewares
│   │   └── auth.middleware.ts    # Autenticação e autorização
│   │
│   ├── plugins/                   # 🔌 Plugins do Fastify
│   │   ├── prisma.ts             # Prisma Client
│   │   ├── jwt.ts                # JWT
│   │   ├── cors.ts               # CORS
│   │   └── swagger.ts            # Documentação Swagger
│   │
│   ├── routes/                    # 🛣️ Rotas
│   │   ├── auth.routes.ts        # Rotas de autenticação
│   │   ├── user.routes.ts        # Rotas de usuários
│   │   └── dashboard.routes.ts   # Rotas de dashboards
│   │
│   ├── schemas/                   # ✅ Validação Zod
│   │   ├── auth.schema.ts        # Schemas de login/refresh
│   │   ├── user.schema.ts        # Schemas de usuário
│   │   └── pagination.schema.ts  # Schema de paginação
│   │
│   ├── services/                  # 🧠 Lógica de negócio
│   │   ├── auth.service.ts       # Autenticação, tokens
│   │   └── user.service.ts       # CRUD de usuários
│   │
│   ├── types/                     # 📘 Tipos TypeScript
│   │   └── fastify.d.ts          # Extensões de tipos do Fastify
│   │
│   └── utils/                     # 🛠️ Utilitários
│       └── pagination.ts          # Helpers de paginação
│
├── .env                            # 🔐 Variáveis de ambiente (não versionado)
├── .env.example                    # 📄 Exemplo de .env
├── .gitignore                      # 🚫 Arquivos ignorados pelo Git
├── docker-compose.yml              # 🐳 Orquestração de containers
├── Dockerfile                      # 📦 Build da imagem Docker
├── package.json                    # 📦 Dependências e scripts
├── package-lock.json               # 🔒 Lock de versões
├── tsconfig.json                   # ⚙️ Configuração TypeScript
└── README.md                       # 📖 Documentação principal
```

---

## 📂 Detalhamento de Cada Pasta

### `/src` - Código-fonte

Contém todo o código TypeScript da aplicação.

**Organização:**

- Separação de responsabilidades (MVC-like)
- Camadas independentes e testáveis
- Facilita manutenção e escalabilidade

---

### `/src/config` - Configurações

**Propósito:** Centralizar configurações da aplicação

**Arquivos:**

- `env.ts` - Variáveis de ambiente tipadas e validadas

**Exemplo:**

```typescript
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};
```

**Por que?**

- ✅ Type-safety: TypeScript sabe os tipos
- ✅ Validação: Garante que variáveis existem
- ✅ Autocomplete: IntelliSense funciona

---

### `/src/controllers` - Controladores

**Propósito:** Receber requisições HTTP, chamar services, retornar respostas

**Responsabilidades:**

1. Extrair dados da requisição (body, query, params)
2. Chamar o service correspondente
3. Tratar erros
4. Retornar resposta formatada

**Exemplo:**

```typescript
export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.login(request.body);
      const token = generateToken(user);
      return reply.status(200).send({ token, user });
    } catch (error) {
      return reply.status(401).send({ message: error.message });
    }
  }
}
```

**Arquivos:**

- `auth.controller.ts` - Login, refresh token, logout
- `user.controller.ts` - CRUD de usuários, perfil

---

### `/src/services` - Lógica de Negócio

**Propósito:** Implementar regras de negócio e acesso ao banco de dados

**Responsabilidades:**

1. Validar regras de negócio
2. Acessar banco via Prisma
3. Processar dados
4. Lançar erros específicos

**Exemplo:**

```typescript
export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new Error("Credenciais inválidas");
    }

    return user;
  }
}
```

**Arquivos:**

- `auth.service.ts` - Autenticação, refresh tokens
- `user.service.ts` - CRUD de usuários

**Diferença Controller vs Service:**

- **Controller**: HTTP específico (request, reply, status codes)
- **Service**: Lógica pura (pode ser reutilizada em outros contextos)

---

### `/src/routes` - Rotas

**Propósito:** Definir endpoints da API e documentação Swagger

**Responsabilidades:**

1. Mapear URL → Controller
2. Definir método HTTP (GET, POST, PUT, DELETE)
3. Adicionar middlewares (auth, validação)
4. Documentar no Swagger

**Exemplo:**

```typescript
export async function authRoutes(app: FastifyInstance) {
  app.route({
    method: "POST",
    url: "/login",
    schema: {
      tags: ["Autenticação"],
      body: loginSchema, // Validação Zod
      response: {
        200: responseSchema, // Documentação Swagger
      },
    },
    handler: authController.login,
  });
}
```

**Arquivos:**

- `auth.routes.ts` - /login, /refresh, /logout
- `user.routes.ts` - /users, /profile
- `dashboard.routes.ts` - /doctors/dashboard, /patients/dashboard

---

### `/src/schemas` - Validação Zod

**Propósito:** Validar dados de entrada (request body, query, params)

**Responsabilidades:**

1. Definir schemas de validação
2. Gerar tipos TypeScript automaticamente
3. Fornecer mensagens de erro claras

**Exemplo:**

```typescript
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

**Arquivos:**

- `auth.schema.ts` - Login, refresh token
- `user.schema.ts` - Criação de usuário
- `pagination.schema.ts` - Paginação (page, limit)

**Vantagens:**

- ✅ Validação em runtime
- ✅ Tipos TypeScript automáticos
- ✅ Integração com Swagger

---

### `/src/middlewares` - Middlewares

**Propósito:** Interceptar requisições antes de chegar aos controllers

**Responsabilidades:**

1. Autenticação (verificar JWT)
2. Autorização (verificar roles)
3. Logging
4. Rate limiting (futuro)

**Exemplo:**

```typescript
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify(); // Verifica token JWT
  } catch (error) {
    return reply.status(401).send({ message: "Não autorizado" });
  }
}
```

**Arquivos:**

- `auth.middleware.ts` - Autenticação e autorização por role

**Uso:**

```typescript
app.route({
  url: "/profile",
  onRequest: [authenticate], // ← Middleware aplicado
  handler: getProfile,
});
```

---

### `/src/plugins` - Plugins do Fastify

**Propósito:** Estender funcionalidades do Fastify

**Responsabilidades:**

1. Registrar bibliotecas externas
2. Adicionar funcionalidades globais
3. Configurar integrações

**Arquivos:**

- `prisma.ts` - Injeta Prisma Client no Fastify
- `jwt.ts` - Configura JWT
- `cors.ts` - Habilita CORS
- `swagger.ts` - Configura documentação

**Exemplo:**

```typescript
// prisma.ts
export default fastifyPlugin(async (fastify) => {
  const prisma = new PrismaClient();
  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
```

**Uso:**

```typescript
// Agora fastify.prisma está disponível globalmente
app.prisma.user.findMany();
```

---

### `/src/utils` - Utilitários

**Propósito:** Funções auxiliares reutilizáveis

**Responsabilidades:**

1. Helpers puros (sem dependências externas)
2. Transformações de dados
3. Cálculos

**Arquivos:**

- `pagination.ts` - Helpers de paginação

**Exemplo:**

```typescript
export function calculatePagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
}
```

---

### `/src/types` - Tipos TypeScript

**Propósito:** Extensões de tipos e declarações customizadas

**Arquivos:**

- `fastify.d.ts` - Estende tipos do Fastify

**Exemplo:**

```typescript
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient; // Adiciona tipagem para fastify.prisma
  }

  interface FastifyRequest {
    user?: { id: number; email: string; type: string };
  }
}
```

---

### `/prisma` - Prisma ORM

**Propósito:** Gerenciar schema e migrations do banco

**Arquivos:**

- `schema.prisma` - Definição dos models
- `migrations/` - Histórico de alterações do banco

**Workflow:**

1. Editar `schema.prisma`
2. Criar migration: `npx prisma migrate dev`
3. Gerar client: `npx prisma generate`
4. Usar no código: `prisma.user.findMany()`

---

### `/docs` - Documentação

**Propósito:** Documentação completa do projeto

**Arquivos:**

- Guias de uso
- Explicações técnicas
- Exemplos de código

---

## 📁 Arquivos da Raiz

| Arquivo              | Propósito                            |
| -------------------- | ------------------------------------ |
| `.env`               | Variáveis de ambiente (senhas, URLs) |
| `.gitignore`         | Arquivos ignorados pelo Git          |
| `docker-compose.yml` | Orquestração de containers           |
| `Dockerfile`         | Build da imagem Docker               |
| `package.json`       | Dependências e scripts               |
| `tsconfig.json`      | Configuração TypeScript              |
| `README.md`          | Documentação principal               |

---

## 🔄 Fluxo de uma Requisição

```
1. Cliente faz request HTTP
   ↓
2. Fastify (app.ts) recebe
   ↓
3. Plugins processam (CORS, validação)
   ↓
4. Middlewares verificam (autenticação)
   ↓
5. Route mapeia URL → Controller
   ↓
6. Zod valida dados
   ↓
7. Controller chama Service
   ↓
8. Service acessa banco via Prisma
   ↓
9. Service retorna dados
   ↓
10. Controller formata resposta
   ↓
11. Fastify envia response JSON
   ↓
12. Cliente recebe resposta
```

---

## 🎯 Princípios de Organização

### Separation of Concerns

Cada pasta tem uma responsabilidade única:

- **Routes**: Mapeamento de URLs
- **Controllers**: Tratamento de HTTP
- **Services**: Lógica de negócio
- **Schemas**: Validação
- **Utils**: Funções auxiliares

### Dependency Flow

```
Routes → Controllers → Services → Prisma → Database
         ↓
      Schemas (validação)
         ↓
      Middlewares (autenticação)
```

### Facilita

- ✅ Testes: Cada camada é testável independentemente
- ✅ Manutenção: Fácil localizar e alterar código
- ✅ Escalabilidade: Adicionar features sem quebrar existentes
- ✅ Trabalho em equipe: Divisão clara de responsabilidades
