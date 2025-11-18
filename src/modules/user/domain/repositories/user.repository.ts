import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: Email): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
