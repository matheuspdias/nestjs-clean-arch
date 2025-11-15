import { Provider } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { TypeOrmUserRepository } from '../persistence/typeorm/typeorm-user.repository';

export const UserRepositoryProvider: Provider = {
  provide: USER_REPOSITORY,
  useClass: TypeOrmUserRepository,
};
