# ⚙️ Guia Completo de Comandos

## 📦 NPM - Gerenciamento de Pacotes

### Instalação de Dependências

```bash
# Instalar todas as dependências do projeto
npm install

# Instalar dependência de produção
npm install <pacote>

# Instalar dependência de desenvolvimento
npm install <pacote> --save-dev

# Atualizar todas as dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Auditar vulnerabilidades de segurança
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix
```

---

## 🚀 Scripts do Projeto

### Desenvolvimento

```bash
# Iniciar servidor em modo desenvolvimento (hot reload)
npm run dev

# O que faz:
# - Usa tsx para executar TypeScript diretamente
# - watch mode: reinicia automaticamente ao salvar arquivos
# - Ideal para desenvolvimento local
```

### Build e Produção

```bash
# Compilar TypeScript → JavaScript
npm run build

# O que faz:
# - Compila src/ → dist/
# - Gera arquivos .js prontos para produção

# Iniciar servidor em produção
npm start

# O que faz:
# - Executa versão compilada (dist/)
# - Sem hot reload
# - Mais rápido e eficiente
```

### Linting e Qualidade

```bash
# Verificar erros de código
npm run lint

# Executar testes
npm test
```

---

## 🗄️ Prisma - Banco de Dados

### Comandos Essenciais

```bash
# 1. GERAR PRISMA CLIENT
# Após alterar schema.prisma, sempre rodar:
npm run generate
# ou
npx prisma generate

# O que faz:
# - Lê o schema.prisma
# - Gera código TypeScript em node_modules/@prisma/client
# - Adiciona types para auto-complete
# - Necessário após qualquer mudança no schema
```

```bash
# 2. CRIAR MIGRATION
# Após alterar schema.prisma e querer aplicar no banco:
npx prisma migrate dev --name nome_descritivo

# Exemplos de nomes:
npx prisma migrate dev --name add_user_table
npx prisma migrate dev --name add_refresh_tokens
npx prisma migrate dev --name add_email_unique_constraint

# O que faz:
# - Compara schema.prisma com banco atual
# - Gera SQL para sincronizar
# - Aplica no banco de desenvolvimento
# - Cria pasta em prisma/migrations/
# - Registra no histórico
```

```bash
# 3. APLICAR MIGRATIONS (Produção)
npx prisma migrate deploy

# Quando usar:
# - CI/CD pipelines
# - Deploy em produção
# - Não cria novas migrations, apenas aplica pendentes
```

```bash
# 4. VISUALIZAR BANCO DE DADOS
npx prisma studio

# O que faz:
# - Abre interface web em http://localhost:5555
# - Visualizar dados
# - Editar registros
# - Criar registros
# - Ideal para debugging
```

```bash
# 5. SINCRONIZAR SCHEMA (Dev Only)
npx prisma db push

# Quando usar:
# - Desenvolvimento rápido
# - Protótipos
# - Não cria migrations
# - CUIDADO: pode perder dados!

# Diferença de migrate dev:
# - db push: Rápido, sem histórico, pode perder dados
# - migrate dev: Seguro, versionado, mantém histórico
```

```bash
# 6. VERIFICAR STATUS
npx prisma migrate status

# O que mostra:
# - Migrations aplicadas
# - Migrations pendentes
# - Estado atual do banco
```

```bash
# 7. RESETAR BANCO (CUIDADO!)
npx prisma migrate reset

# O que faz:
# - APAGA todos os dados
# - Dropa o banco
# - Cria novamente
# - Aplica todas as migrations
# - Roda seeds (se configurado)

# Use apenas em desenvolvimento!
```

```bash
# 8. VALIDAR SCHEMA
npx prisma validate

# O que faz:
# - Verifica sintaxe do schema.prisma
# - Valida relações entre models
# - Detecta erros antes de aplicar
```

```bash
# 9. FORMATAR SCHEMA
npx prisma format

# O que faz:
# - Formata schema.prisma automaticamente
# - Organiza indentação
# - Remove espaços extras
```

---

## 🐳 Docker - Containerização

### Docker Compose

```bash
# SUBIR TODOS OS CONTAINERS
docker-compose up -d

# Flags:
# -d = detached (roda em background)

# O que sobe:
# - API (porta 3000)
# - PostgreSQL (porta 5432)
```

```bash
# SUBIR APENAS POSTGRESQL
docker-compose up -d postgres

# Quando usar:
# - Desenvolvimento local (API roda fora do Docker)
# - Testes de banco
```

```bash
# PARAR CONTAINERS
docker-compose down

# Para todos os containers
# Mantém volumes (dados do banco)
```

```bash
# PARAR E REMOVER VOLUMES
docker-compose down -v

# CUIDADO: Apaga dados do banco!
```

```bash
# VER LOGS
docker-compose logs -f api
docker-compose logs -f postgres

# Flags:
# -f = follow (logs em tempo real)

# Ver últimas 100 linhas:
docker-compose logs --tail=100 api
```

```bash
# REBUILD CONTAINERS
docker-compose build --no-cache
docker-compose up -d

# Quando usar:
# - Após alterar Dockerfile
# - Após npm install
# - --no-cache: Força rebuild completo
```

```bash
# LISTAR CONTAINERS
docker-compose ps

# Mostra:
# - Containers rodando
# - Status
# - Portas mapeadas
```

```bash
# ACESSAR SHELL DO CONTAINER
docker exec -it health-diary-monitoring-api sh

# -i = interactive
# -t = terminal
# sh = shell (alpine usa sh, não bash)

# Sair: exit ou Ctrl+D
```

```bash
# ACESSAR POSTGRESQL
docker exec -it postgres-db psql -U jefferson -d monitordiaryhealthdb

# -U = user
# -d = database

# Comandos úteis no psql:
\dt              # Listar tabelas
\d User          # Descrever tabela User
\q               # Sair
```

### Docker (comandos standalone)

```bash
# LISTAR IMAGENS
docker images

# REMOVER IMAGEM
docker rmi <image-id>

# LISTAR CONTAINERS (incluindo parados)
docker ps -a

# REMOVER CONTAINER
docker rm <container-id>

# LIMPAR TUDO (CUIDADO!)
docker system prune -a

# Remove:
# - Containers parados
# - Imagens não usadas
# - Volumes não usados
# - Networks não usadas
```

---

## 🔐 Variáveis de Ambiente

### Criar arquivo .env

```bash
# Copiar template
cp .env.example .env

# Editar
nano .env
# ou
code .env
```

### Exemplo .env

```env
# Ambiente
NODE_ENV=development

# Servidor
PORT=3000

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui

# Banco de Dados
# Desenvolvimento local (fora do Docker)
DATABASE_URL="postgresql://jefferson:30302220@localhost:5432/monitordiaryhealthdb?schema=public"

# Desenvolvimento com Docker
DATABASE_URL="postgresql://jefferson:30302220@postgres:5432/monitordiaryhealthdb?schema=public"
```

**Diferenças:**

- **localhost** - API roda fora do Docker
- **postgres** - API roda dentro do Docker (nome do serviço)

---

## 🧪 Testes Rápidos (cURL)

### Criar Usuário

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

### Login

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@medical.com",
    "password": "senha123"
  }'
```

### Listar Usuários (com paginação)

```bash
curl "http://localhost:3000/users?page=1&limit=10"
```

### Rota Protegida

```bash
# 1. Fazer login e salvar token
ACCESS_TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@medical.com","password":"senha123"}' \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

# 2. Usar token
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "seu_refresh_token_aqui"
  }'
```

---

## 🔄 Workflow Completo de Desenvolvimento

### 1. Configuração Inicial

```bash
# Clonar projeto
git clone <repo-url>
cd health-diary-monitoring-api

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env

# Subir banco de dados
docker-compose up -d postgres

# Gerar Prisma Client
npm run generate

# Criar e aplicar migrations
npx prisma migrate dev

# Iniciar servidor
npm run dev
```

### 2. Desenvolvimento Diário

```bash
# Sempre que iniciar:
docker-compose up -d postgres   # Subir banco
npm run dev                     # Iniciar API

# Ao alterar schema.prisma:
npm run generate                # Gerar client
npx prisma migrate dev --name descricao  # Criar migration

# Ver dados do banco:
npx prisma studio
```

### 3. Adicionando Nova Feature

```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Implementar código
# ... editar arquivos ...

# 3. Testar
curl -X POST http://localhost:3000/nova-rota

# 4. Commit
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 5. Push
git push origin feature/nova-funcionalidade
```

### 4. Deploy (Produção)

```bash
# 1. Build
npm run build

# 2. Aplicar migrations
npx prisma migrate deploy

# 3. Iniciar
npm start

# OU usar Docker:
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Erro: "Property 'refreshToken' does not exist"

```bash
# Regenerar Prisma Client
npm run generate

# Recarregar VS Code
# Ctrl+Shift+P → "Reload Window"
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### Limpar Tudo e Recomeçar

```bash
# 1. Parar containers
docker-compose down -v

# 2. Limpar node_modules
rm -rf node_modules package-lock.json

# 3. Reinstalar
npm install

# 4. Subir banco
docker-compose up -d postgres

# 5. Reset Prisma
npx prisma migrate reset

# 6. Gerar client
npm run generate

# 7. Iniciar
npm run dev
```

---

## 📝 Comandos Git Úteis

```bash
# Status
git status

# Ver diferenças
git diff

# Adicionar arquivos
git add .

# Commit
git commit -m "mensagem"

# Push
git push

# Pull
git pull

# Criar branch
git checkout -b nome-da-branch

# Ver branches
git branch

# Trocar de branch
git checkout nome-da-branch

# Merge
git merge nome-da-branch

# Ver histórico
git log --oneline
```
