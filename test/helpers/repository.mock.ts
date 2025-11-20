import { IUserRepository } from '../../src/modules/user/domain/repositories/user.repository';
import { User } from '../../src/modules/user/domain/entities/user.entity';
import { Email } from '../../src/modules/user/domain/value-objects/email.vo';

/**
 * Creates a mock implementation of IUserRepository
 */
export function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsByEmail: jest.fn(),
  };
}

/**
 * Repository mock with default implementations
 */
export class MockUserRepository {
  private users: Map<string, User> = new Map();

  save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return Promise.resolve(user || null);
  }

  findByEmail(email: Email): Promise<User | null> {
    const emailValue = email.getValue();
    for (const user of this.users.values()) {
      if (user.email.getValue() === emailValue) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const allUsers = Array.from(this.users.values());
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return Promise.resolve({
      users: paginatedUsers,
      total: allUsers.length,
    });
  }

  update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }

  existsByEmail(email: Email): Promise<boolean> {
    const emailValue = email.getValue();
    for (const user of this.users.values()) {
      if (user.email.getValue() === emailValue) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  clear(): void {
    this.users.clear();
  }

  getAll(): User[] {
    return Array.from(this.users.values());
  }
}
