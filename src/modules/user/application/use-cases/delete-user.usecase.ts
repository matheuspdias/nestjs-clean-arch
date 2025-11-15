import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../shared/base/base.usecase';
import { EntityNotFoundException } from '../../../../shared/exceptions/domain.exception';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase extends BaseUseCase<string, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    await this.userRepository.delete(userId);
  }
}
