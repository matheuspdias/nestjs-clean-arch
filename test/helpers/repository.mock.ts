import { IUserRepository } from '../../src/modules/user/domain/repositories/user.repository';

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
  private users: Map<string, any> = new Map();

  async save(user: any): Promise<any> {
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<any | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: any): Promise<any | null> {
    const emailValue = email.getValue();
    for (const user of this.users.values()) {
      if (user.email.getValue() === emailValue) {
        return user;
      }
    }
    return null;
  }

  async findAll(page: number, limit: number): Promise<{ users: any[]; total: number }> {
    const allUsers = Array.from(this.users.values());
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return {
      users: paginatedUsers,
      total: allUsers.length,
    };
  }

  async update(user: any): Promise<any> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async existsByEmail(email: any): Promise<boolean> {
    const emailValue = email.getValue();
    for (const user of this.users.values()) {
      if (user.email.getValue() === emailValue) {
        return true;
      }
    }
    return false;
  }

  clear(): void {
    this.users.clear();
  }

  getAll(): any[] {
    return Array.from(this.users.values());
  }
}
