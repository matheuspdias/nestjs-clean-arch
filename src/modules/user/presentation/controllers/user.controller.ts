import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiGetOperation,
  ApiListOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
  ApiPagination,
} from '../../../../shared/decorators/swagger';
import { CreateUserDto } from '../../application/dto/request/create-user.dto';
import { UpdateUserDto } from '../../application/dto/request/update-user.dto';
import {
  PaginatedUserResponseDto,
  UserResponseDto,
} from '../../application/dto/response/user-response.dto';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../application/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../application/use-cases/list-users.usecase';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.usecase';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperation(UserResponseDto, 'Create a new user')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  @ApiListOperation(PaginatedUserResponseDto, 'List all users with pagination')
  @ApiPagination()
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedUserResponseDto> {
    return this.listUsersUseCase.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  @ApiGetOperation(UserResponseDto, 'Get a user by ID')
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }

  @Put(':id')
  @ApiUpdateOperation(UserResponseDto, 'Update a user')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute({ userId: id, data: updateUserDto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteOperation('Delete a user')
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}
