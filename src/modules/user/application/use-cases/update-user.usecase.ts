import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../shared/base/base.usecase';
import {
  DomainException,
  EntityNotFoundException,
} from '../../../../shared/exceptions/domain.exception';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UpdateUserDto } from '../dto/request/update-user.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';

export interface UpdateUserRequest {
  userId: string;
  data: UpdateUserDto;
}

@Injectable()
export class UpdateUserUseCase extends BaseUseCase<
  UpdateUserRequest,
  UserResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async execute(request: UpdateUserRequest): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw new EntityNotFoundException('User', request.userId);
    }

    // Update email if provided
    if (request.data.email) {
      const newEmail = Email.create(request.data.email);

      // Check if new email is different and not already in use
      if (!user.email.equals(newEmail)) {
        const emailExists = await this.userRepository.existsByEmail(newEmail);
        if (emailExists) {
          throw new DomainException('Email already in use');
        }
        user.updateEmail(newEmail);
      }
    }

    // Update name if provided
    if (request.data.name) {
      user.updateName(request.data.name);
    }

    // Update password if provided
    if (request.data.password) {
      const newPassword = await Password.create(request.data.password);
      user.updatePassword(newPassword);
    }

    const updatedUser = await this.userRepository.update(user);

    return UserResponseDto.fromDomain(updatedUser.toObject());
  }
}
