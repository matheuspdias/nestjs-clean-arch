import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../shared/base/base.usecase';
import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';

@Injectable()
export class CreateUserUseCase extends BaseUseCase<
  CreateUserDto,
  UserResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async execute(request: CreateUserDto): Promise<UserResponseDto> {
    const email = Email.create(request.email);

    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new DomainException('Email already in use');
    }

    // Hash password using Password value object
    const password = await Password.create(request.password);

    // Create user entity
    const user = User.create({
      name: request.name,
      email,
      password,
    });

    // Save to repository
    const savedUser = await this.userRepository.save(user);

    // Return response DTO
    return UserResponseDto.fromDomain(savedUser.toObject());
  }
}
