import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from './application/use-cases/delete-user.usecase';
import { GetUserUseCase } from './application/use-cases/get-user.usecase';
import { ListUsersUseCase } from './application/use-cases/list-users.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { TypeOrmUserModel } from './infrastructure/persistence/typeorm/typeorm-user.model';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/typeorm-user.repository';
import { UserRepositoryProvider } from './infrastructure/providers/user-repository.provider';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserModel])],
  controllers: [UserController],
  providers: [
    UserRepositoryProvider,
    TypeOrmUserRepository,
    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UserRepositoryProvider],
})
export class UserModule {}
