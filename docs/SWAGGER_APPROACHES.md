# Abordagens para Organizar Swagger no NestJS

Este documento compara diferentes formas de organizar a documentação Swagger no NestJS, similar aos Traits do Laravel.

## Comparação: Laravel Traits vs NestJS

### Laravel (com Traits)
```php
class UserController extends Controller
{
    use SwaggerUserTrait; // Toda documentação aqui

    public function index() {
        // código limpo
    }
}
```

### NestJS - Opções Disponíveis

## 1. Decoradores Padrão (Atual)

**Arquivo**: [user.controller.ts](../src/modules/user/presentation/controllers/user.controller.ts)

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'User successfully created',
  type: UserResponseDto,
})
@ApiBadRequestResponse({
  description: 'Invalid input data',
})
async create(@Body() createUserDto: CreateUserDto) {
  return this.createUserUseCase.execute(createUserDto);
}
```

**Prós:**
- Padrão oficial do NestJS
- Autocomplete funciona perfeitamente
- Documentação inline

**Contras:**
- Muito verboso
- Código fica poluído
- Difícil de manter

## 2. Decoradores Customizados (Recomendado) ✅

**Arquivo**: [user.controller.clean.ts](../src/modules/user/presentation/controllers/user.controller.clean.ts)

```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiCreateOperation(UserResponseDto, 'Create a new user')
async create(@Body() createUserDto: CreateUserDto) {
  return this.createUserUseCase.execute(createUserDto);
}
```

**Implementação**:
```typescript
// src/shared/decorators/swagger/api-crud.decorator.ts
export const ApiCreateOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: 'Resource successfully created',
      type: model,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
  );
};
```

**Prós:**
- Código limpo e conciso
- Reutilizável
- Fácil de manter
- Type-safe
- Similar ao conceito de Traits

**Contras:**
- Precisa criar os decoradores customizados
- Menos flexível para casos muito específicos

## 3. Plugin CLI do NestJS

O NestJS possui um plugin CLI que gera automaticamente parte da documentação Swagger baseado em tipos TypeScript.

**nest-cli.json**:
```json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

Com o plugin, você pode fazer:

```typescript
// Antes (sem plugin)
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;
}

// Depois (com plugin) - ApiProperty é inferido!
export class CreateUserDto {
  @IsString()
  name: string;
}
```

**Prós:**
- Menos código repetitivo
- Inferência automática de tipos
- Detecta decoradores de validação

**Contras:**
- Funciona apenas em DTOs
- Não elimina decoradores do controller
- Pode ter bugs em casos edge

## 4. Separar em Arquivos de Configuração

Criar arquivos separados com a configuração do Swagger:

```typescript
// user.swagger.config.ts
export const UserSwaggerConfig = {
  create: {
    summary: 'Create a new user',
    responses: {
      201: { type: UserResponseDto },
      400: { description: 'Invalid data' },
    }
  }
};

// user.controller.ts
@Post()
@ApiOperation(UserSwaggerConfig.create)
async create() { }
```

**Prós:**
- Separação de responsabilidades
- Fácil de encontrar toda documentação

**Contras:**
- Mais arquivos para manter
- Ainda verboso
- Type-safety limitado

## Comparação de Linhas de Código

### Abordagem Padrão
```typescript
// ~15 linhas de Swagger por endpoint
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'User successfully created',
  type: UserResponseDto,
})
@ApiBadRequestResponse({
  description: 'Invalid input data or email already in use',
})
async create(@Body() dto: CreateUserDto) {
  return this.createUserUseCase.execute(dto);
}
```

### Decoradores Customizados
```typescript
// ~3 linhas de Swagger por endpoint
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiCreateOperation(UserResponseDto, 'Create a new user')
async create(@Body() dto: CreateUserDto) {
  return this.createUserUseCase.execute(dto);
}
```

**Redução: ~80% menos código!**

## Recomendação Final

Para um projeto seguindo Clean Architecture e DDD, a melhor abordagem é:

### ✅ Decoradores Customizados + Plugin CLI

1. **Use decoradores customizados** para operações CRUD comuns
2. **Ative o plugin CLI** para inferência automática em DTOs
3. **Use decoradores padrão** apenas para casos muito específicos

### Estrutura Recomendada

```
src/
├── shared/
│   └── decorators/
│       └── swagger/
│           ├── api-crud.decorator.ts      # CRUD operations
│           ├── api-paginated.decorator.ts # Pagination
│           ├── api-auth.decorator.ts      # Auth endpoints
│           └── index.ts
```

## Exemplo Prático

### Controller ANTES (76 linhas)
```typescript
// 5 endpoints x ~15 linhas = 75+ linhas de Swagger
```

### Controller DEPOIS (25 linhas)
```typescript
@ApiTags('Users')
@Controller('users')
export class UserController {
  @Post()
  @ApiCreateOperation(UserResponseDto, 'Create user')
  create(@Body() dto: CreateUserDto) { }

  @Get()
  @ApiListOperation(PaginatedUserResponseDto, 'List users')
  @ApiPagination()
  list(@Query('page') page, @Query('limit') limit) { }

  @Get(':id')
  @ApiGetOperation(UserResponseDto, 'Get user')
  getById(@Param('id') id) { }

  @Put(':id')
  @ApiUpdateOperation(UserResponseDto, 'Update user')
  update(@Param('id') id, @Body() dto: UpdateUserDto) { }

  @Delete(':id')
  @ApiDeleteOperation('Delete user')
  delete(@Param('id') id) { }
}
```

**Resultado: 67% menos código, muito mais legível!**

## Arquivos Criados

Os decoradores customizados já estão implementados em:
- [api-crud.decorator.ts](../src/shared/decorators/swagger/api-crud.decorator.ts)
- [api-paginated.decorator.ts](../src/shared/decorators/swagger/api-paginated.decorator.ts)
- [user.controller.clean.ts](../src/modules/user/presentation/controllers/user.controller.clean.ts) (exemplo)

Para usar, basta importar e aplicar nos seus controllers!
