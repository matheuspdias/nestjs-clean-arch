import { User } from '../../src/modules/user/domain/entities/user.entity';
import { Email } from '../../src/modules/user/domain/value-objects/email.vo';
import { Password } from '../../src/modules/user/domain/value-objects/password.vo';
import { UserId } from '../../src/modules/user/domain/value-objects/user-id.vo';

/**
 * Factory for creating User test data
 */
export class UserFactory {
  /**
   * Creates a User with default or custom values
   */
  static async create(
    overrides: {
      id?: string;
      name?: string;
      email?: string;
      password?: string;
      createdAt?: Date;
      updatedAt?: Date;
    } = {},
  ): Promise<User> {
    const defaults = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const data = { ...defaults, ...overrides };

    return User.create({
      id: data.id ? UserId.create(data.id) : undefined,
      name: data.name,
      email: Email.create(data.email),
      password: await Password.create(data.password),
    });
  }

  /**
   * Creates a User from database state (reconstitute)
   */
  static async reconstitute(
    overrides: {
      id?: string;
      name?: string;
      email?: string;
      password?: string;
      createdAt?: Date;
      updatedAt?: Date;
    } = {},
  ): Promise<User> {
    const defaults = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const data = { ...defaults, ...overrides };

    return User.reconstitute({
      id: UserId.create(data.id),
      name: data.name,
      email: Email.create(data.email),
      password: await Password.create(data.password),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Creates multiple users with sequential data
   */
  static async createMany(count: number): Promise<User[]> {
    const users: User[] = [];

    for (let i = 1; i <= count; i++) {
      const user = await this.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: `password${i}`,
      });
      users.push(user);
    }

    return users;
  }

  /**
   * Creates a user with a specific email for testing uniqueness
   */
  static async createWithEmail(email: string): Promise<User> {
    return this.create({ email });
  }

  /**
   * Creates a user with invalid data (for testing validation)
   */
  static async createInvalid(
    invalidField: 'name' | 'email' | 'password',
  ): Promise<User> {
    const invalidData = {
      name: invalidField === 'name' ? 'AB' : 'Valid Name',
      email: invalidField === 'email' ? 'invalid-email' : 'valid@example.com',
      password: invalidField === 'password' ? '12345' : 'validPassword',
    };

    return this.create(invalidData);
  }
}
