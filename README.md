# NestJS Clean Architecture - User CRUD

Um projeto completo de CRUD de usuários implementado com **NestJS**, seguindo rigorosamente os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

## Características

- Clean Architecture com separação clara de camadas
- Domain-Driven Design (DDD) com Entidades e Value Objects
- SOLID principles aplicados
- TypeORM com MySQL 8
- Validação robusta com class-validator
- Documentação automática com Swagger
- Docker com nginx, MySQL e Node.js
- Dados persistentes em volumes Docker

## Stack Tecnológica

- **NestJS** - Framework Node.js progressivo
- **TypeORM** - ORM para TypeScript e JavaScript
- **MySQL 8** - Sistema de gerenciamento de banco de dados
- **Swagger** - Documentação interativa da API
- **Docker & Docker Compose** - Containerização
- **Nginx** - Reverse proxy e servidor web
- **class-validator** - Validação declarativa de DTOs
- **class-transformer** - Transformação de objetos

## Início Rápido

### Com Docker

#### Desenvolvimento (com Hot Reload) ⚡

Para desenvolvimento com **hot reload automático** quando você edita o código:

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd nestjs-clean-arch

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar em modo desenvolvimento
docker-compose -f docker-compose.dev.yml up -d --build

# 4. Acessar a aplicação
# API: http://localhost/api
# Swagger: http://localhost/api/docs
```

**Mudanças no código são refletidas automaticamente!** Não precisa reiniciar o container.

#### Produção

Para produção (build otimizado):

```bash
# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar em modo produção
docker-compose up -d --build

# Acessar a aplicação
# API: http://localhost/api
# Swagger: http://localhost/api/docs
```

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Iniciar MySQL via Docker
docker-compose up -d mysql

# Executar em modo desenvolvimento
npm run start:dev

# A aplicação estará disponível em:
# API: http://localhost:3000/api
# Swagger: http://localhost:3000/api/docs
```

## Estrutura do Projeto

```
src/
├── modules/
│   └── user/                          # Módulo de Usuário
│       ├── domain/                    # Camada de Domínio
│       │   ├── entities/              # Entidades de negócio
│       │   ├── value-objects/         # Value Objects (Email, UserId)
│       │   ├── repositories/          # Interfaces de repositórios
│       │   └── services/              # Serviços de domínio
│       │
│       ├── application/               # Casos de Uso
│       │   ├── dto/                   # Data Transfer Objects
│       │   │   ├── request/           # DTOs de entrada
│       │   │   └── response/          # DTOs de saída
│       │   └── use-cases/             # Lógica de aplicação
│       │
│       ├── infrastructure/            # Infraestrutura
│       │   ├── persistence/           # TypeORM models e repositories
│       │   └── providers/             # Provedores de DI
│       │
│       └── presentation/              # Camada de Apresentação
│           └── controllers/           # Controllers REST
│
└── shared/                            # Código compartilhado
    ├── base/                          # Classes base
    ├── exceptions/                    # Exceções customizadas
    └── utils/                         # Utilitários
```

## API Endpoints

### Base URL
- **Docker**: `http://localhost/api`
- **Local**: `http://localhost:3000/api`

### Documentação Swagger
- **Docker**: `http://localhost/api/docs`
- **Local**: `http://localhost:3000/api/docs`

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users` | Criar novo usuário |
| GET | `/api/users` | Listar usuários (paginado) |
| GET | `/api/users/:id` | Buscar usuário por ID |
| PUT | `/api/users/:id` | Atualizar usuário |
| DELETE | `/api/users/:id` | Deletar usuário |

### Exemplos de Uso

#### Criar Usuário
```bash
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

#### Listar Usuários
```bash
curl http://localhost/api/users?page=1&limit=10
```

#### Buscar Usuário
```bash
curl http://localhost/api/users/{id}
```

#### Atualizar Usuário
```bash
curl -X PUT http://localhost/api/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

#### Deletar Usuário
```bash
curl -X DELETE http://localhost/api/users/{id}
```

## Validações

### Email
- Formato válido de e-mail
- Máximo 255 caracteres
- Único no sistema
- Convertido para lowercase

### Nome
- Mínimo 3 caracteres
- Máximo 100 caracteres
- Não pode estar vazio

### Senha
- Mínimo 6 caracteres

## Database Migrations

Por padrão, o projeto usa `synchronize: true` no TypeORM, que cria/atualiza automaticamente as tabelas em desenvolvimento. **Em produção, use migrations**.

### Configuração Atual

O projeto está configurado com **auto-sincronização** para facilitar o desenvolvimento:
- As tabelas são criadas automaticamente ao iniciar
- Mudanças no schema são aplicadas automaticamente
- **ATENÇÃO**: Desabilite em produção (`synchronize: false`)

### Usando Migrations (Recomendado para Produção)

#### 1. Desabilitar Auto-Sync

Edite [src/app.module.ts](src/app.module.ts):
```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // Mude para false
  // ...
})
```

#### 2. Adicionar Scripts de Migration

Adicione ao [package.json](package.json):
```json
"scripts": {
  "typeorm": "typeorm-ts-node-commonjs",
  "migration:generate": "npm run typeorm -- migration:generate -d ormconfig.json",
  "migration:create": "npm run typeorm -- migration:create",
  "migration:run": "npm run typeorm -- migration:run -d ormconfig.json",
  "migration:revert": "npm run typeorm -- migration:revert -d ormconfig.json",
  "migration:show": "npm run typeorm -- migration:show -d ormconfig.json"
}
```

#### 3. Comandos de Migration

```bash
# Gerar migration automaticamente (baseado nas mudanças das entities)
npm run migration:generate -- src/migrations/CreateUsersTable

# Criar migration vazia (manual)
npm run migration:create -- src/migrations/AddUserRoles

# Executar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Ver status das migrations
npm run migration:show
```

#### 4. Executar Migrations no Docker

```bash
# Entrar no container
docker exec -it nestjs-app sh

# Executar migrations
npm run migration:run

# Sair
exit
```

### Migration Incluída

O projeto já inclui uma migration de exemplo em [src/migrations/1700000000000-CreateUsersTable.ts](src/migrations/1700000000000-CreateUsersTable.ts) que cria:
- Tabela `users` com todos os campos
- Índice único em `email`
- Campos de timestamp automáticos

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo watch

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia em produção

# Testes
npm run test               # Testes unitários
npm run test:e2e           # Testes E2E
npm run test:cov           # Cobertura de testes

# Linting
npm run lint               # Verifica código
npm run format             # Formata código
```

## Docker

### Comandos Úteis

#### Modo Desenvolvimento (Hot Reload)

```bash
# Iniciar em modo desenvolvimento
docker-compose -f docker-compose.dev.yml up -d --build

# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml logs -f app

# Parar os serviços (mantém dados)
docker-compose -f docker-compose.dev.yml down

# Parar e remover volumes (APAGA o banco de dados!)
docker-compose -f docker-compose.dev.yml down -v

# Reiniciar apenas a aplicação
docker-compose -f docker-compose.dev.yml restart app

# Acessar shell do container
docker exec -it nestjs-app sh
```

#### Modo Produção

```bash
# Iniciar em modo produção
docker-compose up -d --build

# Ver logs
docker-compose logs -f
docker-compose logs -f app

# Parar os serviços
docker-compose down

# Rebuild após mudanças no código
docker-compose up -d --build app
```

#### Comandos Gerais

```bash
# Verificar status dos serviços
docker-compose ps

# Ver uso de recursos
docker stats

# Limpar tudo (containers, volumes, imagens)
docker-compose down -v --rmi all
```

### Serviços

- **nginx** - Porta 80 (http://localhost)
- **app** - NestJS (porta 3000 interna)
- **mysql** - Porta 3306

## Arquitetura

Este projeto segue os princípios de **Clean Architecture** e **DDD**. Para informações detalhadas sobre a arquitetura, decisões de design e padrões utilizados, consulte [ARCHITECTURE.md](ARCHITECTURE.md).

### Princípios Aplicados

- **Clean Architecture**: Separação de camadas com dependências unidirecionais
- **DDD**: Entidades ricas, Value Objects, Aggregates e Repository Pattern
- **SOLID**: Código coeso e de baixo acoplamento
- **Dependency Inversion**: Uso de interfaces e injeção de dependência

## Variáveis de Ambiente

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=nestjs
DB_PASSWORD=secret
DB_DATABASE=nestjs_clean_arch
DB_ROOT_PASSWORD=root

# Nginx
NGINX_PORT=80
```

## Melhorias Futuras

- [ ] Hash de senhas com bcrypt
- [ ] Autenticação JWT
- [ ] Refresh tokens
- [ ] Eventos de domínio
- [ ] Cache com Redis
- [ ] Logs estruturados
- [ ] Testes unitários e E2E completos
- [ ] CI/CD pipeline
- [ ] Rate limiting
- [ ] API versioning
- [ ] Health checks
- [ ] Métricas e monitoramento

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com NestJS** 🚀
