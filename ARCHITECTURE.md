# User CRUD - Clean Architecture & DDD

Este projeto implementa um CRUD completo de usuários seguindo os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

## Arquitetura

### Estrutura de Pastas

```
src/
├── modules/user/
│   ├── domain/               # Camada de Domínio (regras de negócio)
│   │   ├── entities/         # Entidades de domínio
│   │   ├── value-objects/    # Value Objects (Email, UserId)
│   │   ├── repositories/     # Interfaces de repositórios
│   │   └── services/         # Serviços de domínio
│   │
│   ├── application/          # Casos de Uso (orquestração)
│   │   ├── dto/              # Data Transfer Objects
│   │   └── use-cases/        # Casos de uso (create, update, delete, get, list)
│   │
│   ├── infrastructure/       # Infraestrutura (implementações)
│   │   ├── persistence/      # TypeORM models e repositories
│   │   └── providers/        # Provedores de injeção de dependência
│   │
│   └── presentation/         # Interface HTTP
│       └── controllers/      # Controllers REST
│
└── shared/                   # Código compartilhado
    ├── base/                 # Classes base (Entity, UseCase)
    ├── exceptions/           # Exceções customizadas
    └── utils/                # Utilitários
```

### Camadas

#### 1. Domain (Domínio)

- **Entidades**: `User` - Lógica de negócio pura
- **Value Objects**: `Email`, `UserId` - Validações e encapsulamento
- **Repository Interface**: Contrato para persistência

#### 2. Application (Aplicação)

- **Use Cases**: Casos de uso isolados e testáveis
  - `CreateUserUseCase`
  - `GetUserUseCase`
  - `ListUsersUseCase`
  - `UpdateUserUseCase`
  - `DeleteUserUseCase`
- **DTOs**: Validação de entrada/saída

#### 3. Infrastructure (Infraestrutura)

- **TypeORM Models**: Mapeamento para o banco de dados
- **Repositories**: Implementação concreta da interface

#### 4. Presentation (Apresentação)

- **Controllers**: Endpoints REST
- **Swagger**: Documentação automática

## Princípios Aplicados

### Clean Architecture

- Separação clara de responsabilidades
- Dependências apontam para dentro (Domain não conhece Infrastructure)
- Inversão de dependência via interfaces

### DDD (Domain-Driven Design)

- **Entidades**: Identidade e ciclo de vida
- **Value Objects**: Imutabilidade e validação
- **Aggregates**: User como raiz do agregado
- **Repositories**: Abstração de persistência
- **Domain Services**: Lógica de negócio complexa

### SOLID

- **SRP**: Cada classe tem uma responsabilidade única
- **OCP**: Aberto para extensão, fechado para modificação
- **LSP**: Substituição de implementações
- **ISP**: Interfaces segregadas
- **DIP**: Dependência de abstrações (interfaces)

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Swagger

```
http://localhost:3000/api/docs
```

### Endpoints

#### 1. Criar Usuário

```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "StrongP@ss123"
}
```

#### 2. Listar Usuários (Paginado)

```http
GET /users?page=1&limit=10
```

#### 3. Buscar Usuário por ID

```http
GET /users/{id}
```

#### 4. Atualizar Usuário

```http
PUT /users/{id}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

#### 5. Deletar Usuário

```http
DELETE /users/{id}
```

## Validações Implementadas

### Email (Value Object)

- Formato válido de e-mail
- Não pode estar vazio
- Máximo 255 caracteres
- Convertido para lowercase

### UserId (Value Object)

- UUID válido
- Gerado automaticamente se não fornecido

### User Entity

- Nome: mínimo 3 caracteres, máximo 100
- Senha: mínimo 6 caracteres
- Email único no sistema

## Como Executar

### Com Docker (Recomendado)

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar todos os serviços
docker-compose up -d

# Acessar a aplicação
http://localhost
http://localhost/api/docs (Swagger)
```

### Localmente

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env

# Iniciar MySQL
docker-compose up -d mysql

# Executar em desenvolvimento
npm run start:dev

# Executar em produção
npm run build
npm run start:prod
```

## Testes

### Estrutura de Testes (Exemplos)

```typescript
// Domain Layer
describe('User Entity', () => {
  it('should create a valid user', () => {});
  it('should throw error for invalid name', () => {});
});

// Application Layer
describe('CreateUserUseCase', () => {
  it('should create a user successfully', () => {});
  it('should throw error if email already exists', () => {});
});
```

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para MySQL
- **MySQL 8** - Banco de dados
- **Swagger** - Documentação API
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de dados
- **Docker** - Containerização
- **Nginx** - Reverse proxy

## Benefícios da Arquitetura

1. **Testabilidade**: Camadas isoladas, fácil de mockar
2. **Manutenibilidade**: Código organizado e previsível
3. **Escalabilidade**: Fácil adicionar novos módulos
4. **Flexibilidade**: Troca de tecnologias sem impacto no domínio
5. **Clareza**: Separação clara de responsabilidades
6. **Reutilização**: Código compartilhado em `shared/`

## Contato

Para dúvidas ou sugestões, abra uma issue no repositório.
