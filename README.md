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

### Com Docker (Recomendado) ⚡

Este projeto está configurado para desenvolvimento com **hot reload automático** - mudanças no código são refletidas instantaneamente!

```bash
# 1. Clonar o repositório
git clone https://github.com/matheuspdias/nestjs-clean-arch.git
cd nestjs-clean-arch

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar os containers
docker-compose up -d --build

# 4. Acessar a aplicação
# API: http://localhost/api
# Swagger: http://localhost/api/docs
```

**Mudanças no código são refletidas automaticamente!** Não precisa reiniciar o container.

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

| Método | Endpoint         | Descrição                  |
| ------ | ---------------- | -------------------------- |
| POST   | `/api/users`     | Criar novo usuário         |
| GET    | `/api/users`     | Listar usuários (paginado) |
| GET    | `/api/users/:id` | Buscar usuário por ID      |
| PUT    | `/api/users/:id` | Atualizar usuário          |
| DELETE | `/api/users/:id` | Deletar usuário            |

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

## Database

### Auto-Sincronização (Padrão)

O projeto usa `synchronize: true` no TypeORM, que cria/atualiza automaticamente as tabelas ao iniciar:

- As tabelas são criadas automaticamente
- Mudanças no schema são aplicadas automaticamente
- Perfeito para desenvolvimento e testes de DDD/Clean Arch

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

```bash
# Iniciar os containers
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f
docker-compose logs -f app

# Parar os serviços (mantém dados)
docker-compose down

# Parar e remover volumes (APAGA o banco de dados!)
docker-compose down -v

# Reiniciar apenas a aplicação
docker-compose restart app

# Verificar status dos serviços
docker-compose ps

# Acessar shell do container
docker exec -it nestjs-app sh

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
NODE_ENV=development
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
