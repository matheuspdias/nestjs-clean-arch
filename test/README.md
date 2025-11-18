# Test Documentation

Este diretório contém todos os testes do projeto, organizados por tipo e seguindo os princípios de Clean Architecture.

## ⚠️ Importante: Executar Testes no Docker

**Este projeto usa Docker**, portanto todos os comandos de teste devem ser executados **dentro do container**:

```bash
# ✅ Correto
docker exec nestjs-app npm test

# ❌ Errado (não funciona no host)
npm test
```

**Por quê?** O Node.js e todas as dependências (incluindo Jest) estão instalados dentro do container Docker, não no seu sistema host.

## Estrutura de Testes

```
test/
├── helpers/              # Utilitários e helpers de teste
│   ├── user.factory.ts   # Factory para criar objetos User de teste
│   ├── repository.mock.ts # Mocks de repositórios
│   └── test-database.ts  # Configuração de banco de dados de teste
├── setup-e2e.ts         # Configuração global dos testes E2E
├── user.e2e-spec.ts     # Testes E2E do CRUD de usuários
└── jest-e2e.json        # Configuração do Jest para E2E

src/
└── modules/user/
    ├── domain/
    │   ├── entities/
    │   │   └── user.entity.spec.ts         # Testes unitários da entidade User
    │   └── value-objects/
    │       ├── email.vo.spec.ts            # Testes unitários do Email VO
    │       ├── password.vo.spec.ts         # Testes unitários do Password VO
    │       └── user-id.vo.spec.ts          # Testes unitários do UserId VO
    ├── application/
    │   └── use-cases/
    │       ├── create-user.usecase.spec.ts # Testes unitários do CreateUserUseCase
    │       ├── get-user.usecase.spec.ts    # Testes unitários do GetUserUseCase
    │       ├── update-user.usecase.spec.ts # Testes unitários do UpdateUserUseCase
    │       ├── delete-user.usecase.spec.ts # Testes unitários do DeleteUserUseCase
    │       └── list-users.usecase.spec.ts  # Testes unitários do ListUsersUseCase
    └── infrastructure/
        └── persistence/
            └── typeorm/
                └── typeorm-user.repository.spec.ts # Testes de integração do Repository
```

## Tipos de Testes

### 1. Testes Unitários (Unit Tests)

Testam componentes isolados sem dependências externas.

**Localização:** Ao lado do código fonte (`*.spec.ts`)

**Exemplos:**
- Value Objects (Email, Password, UserId)
- Entidades de domínio (User)
- Use Cases (com repositórios mockados)

**Como executar (no Docker):**
```bash
# Todos os testes unitários
docker exec nestjs-app npm test

# Modo watch (reexecuta automaticamente)
docker exec nestjs-app npm run test:watch

# Com cobertura de código
docker exec nestjs-app npm run test:cov

# Arquivo específico
docker exec nestjs-app npm test -- user.entity.spec.ts
```

### 2. Testes de Integração (Integration Tests)

Testam a integração entre componentes, geralmente com banco de dados real.

**Localização:** Junto com o código de infraestrutura

**Exemplos:**
- TypeOrmUserRepository (com SQLite in-memory)

**Como executar (no Docker):**
```bash
# Testes de integração estão incluídos em 'npm test'
docker exec nestjs-app npm test -- typeorm-user.repository.spec.ts
```

### 3. Testes E2E (End-to-End Tests)

Testam a aplicação completa através da API HTTP.

**Localização:** Diretório `test/`

**Exemplos:**
- CRUD completo de usuários através de endpoints REST

**Como executar (no Docker):**
```bash
# Todos os testes E2E
docker exec nestjs-app npm run test:e2e

# Com cobertura
docker exec nestjs-app npm run test:e2e -- --coverage
```

## Helpers e Utilitários

### UserFactory

Factory para criar objetos User de teste:

```typescript
import { UserFactory } from '../test/helpers';

// Criar usuário com valores padrão
const user = await UserFactory.create();

// Criar com valores customizados
const user = await UserFactory.create({
  name: 'Custom Name',
  email: 'custom@example.com',
});

// Criar múltiplos usuários
const users = await UserFactory.createMany(5);

// Reconstituir usuário do banco
const user = await UserFactory.reconstitute({
  id: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### Repository Mocks

Mocks de repositórios para testes unitários:

```typescript
import { createMockUserRepository, MockUserRepository } from '../test/helpers';

// Mock simples com Jest
const mockRepo = createMockUserRepository();
mockRepo.findById.mockResolvedValue(user);

// Mock com implementação funcional
const mockRepo = new MockUserRepository();
await mockRepo.save(user);
const found = await mockRepo.findById(user.id);
```

### Test Database

Configurações de banco de dados para testes:

```typescript
import { createTestDatabaseConfig } from '../test/helpers';

// SQLite in-memory (rápido, isolado)
const config = createTestDatabaseConfig();

// MySQL de teste (mais realista)
const config = createMySQLTestDatabaseConfig();
```

## Convenções de Teste

### Nomenclatura

- **Unitários:** `*.spec.ts` (ao lado do código)
- **E2E:** `*.e2e-spec.ts` (no diretório test/)

### Estrutura de describe/it

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Padrão AAA (Arrange-Act-Assert)

```typescript
it('should create a user', async () => {
  // Arrange
  const dto = { name: 'John', email: 'john@example.com', password: 'pass123' };

  // Act
  const result = await useCase.execute(dto);

  // Assert
  expect(result.name).toBe('John');
});
```

## Cobertura de Testes

### Executar com cobertura

```bash
# Testes unitários
npm run test:cov

# Testes E2E
npm run test:e2e -- --coverage
```

### Relatórios

- **Unitários:** `coverage/`
- **E2E:** `coverage-e2e/`

Abra `coverage/lcov-report/index.html` no navegador para ver o relatório detalhado.

## Boas Práticas

### 1. Testes Unitários

✅ **Fazer:**
- Testar lógica de negócio isoladamente
- Usar mocks para dependências externas
- Testar casos de sucesso e erro
- Testar validações e edge cases

❌ **Evitar:**
- Testar implementação interna (testes devem ser resistentes a refatoração)
- Depender de banco de dados ou APIs externas
- Testes muito longos ou complexos

### 2. Testes de Integração

✅ **Fazer:**
- Usar banco de dados in-memory quando possível
- Limpar dados entre testes (beforeEach/afterEach)
- Testar mapeamento entre camadas (domain ↔ infrastructure)

❌ **Evitar:**
- Compartilhar estado entre testes
- Depender de ordem de execução

### 3. Testes E2E

✅ **Fazer:**
- Testar fluxos completos de usuário
- Verificar respostas HTTP (status, body, headers)
- Testar validações de entrada
- Limpar dados após cada teste

❌ **Evitar:**
- Testes muito longos ou dependentes
- Hardcoded IDs ou dados
- Depender de dados de produção

## Debugging de Testes

### VS Code

Adicione ao `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "${fileBasename}",
    "--config",
    "jest.config.json"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Modo Debug

```bash
# Unitários
npm run test:debug

# E2E
node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --config ./test/jest-e2e.json --runInBand
```

## CI/CD

Os testes devem ser executados no pipeline de CI/CD:

```bash
# Pipeline exemplo
npm install
npm run lint
npm run test:cov
npm run test:e2e
npm run build
```

## Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
