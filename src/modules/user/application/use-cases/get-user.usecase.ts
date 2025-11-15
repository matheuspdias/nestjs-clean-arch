import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../shared/base/base.usecase';
import { EntityNotFoundException } from '../../../../shared/exceptions/domain.exception';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { UserResponseDto } from '../dto/response/user-response.dto';

@Injectable()
export class GetUserUseCase extends BaseUseCase<string, UserResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    return UserResponseDto.fromDomain(user.toObject());
  }
}
