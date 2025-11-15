import { Inject, Injectable } from '@nestjs/common';
import { BaseUseCase } from '../../../../shared/base/base.usecase';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { PaginatedUserResponseDto, UserResponseDto } from '../dto/response/user-response.dto';

export interface ListUsersRequest {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListUsersUseCase extends BaseUseCase<
  ListUsersRequest,
  PaginatedUserResponseDto
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  async execute(request: ListUsersRequest): Promise<PaginatedUserResponseDto> {
    const page = request.page || 1;
    const limit = request.limit || 10;

    const { users, total } = await this.userRepository.findAll(page, limit);

    const response = new PaginatedUserResponseDto();
    response.users = users.map((user) => UserResponseDto.fromDomain(user.toObject()));
    response.total = total;
    response.page = page;
    response.limit = limit;
    response.totalPages = Math.ceil(total / limit);

    return response;
  }
}
