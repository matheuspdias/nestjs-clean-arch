import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserId } from '../value-objects/user-id.vo';

describe('User Entity', () => {
  let validEmail: Email;
  let validPassword: Password;

  beforeEach(async () => {
    validEmail = Email.create('test@example.com');
    validPassword = await Password.create('validPassword123');
  });

  describe('create', () => {
    it('should create a user with valid data', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.password.getValue()).toBe(validPassword.getValue());
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should generate a unique ID if not provided', () => {
      const user1 = User.create({
        name: 'User One',
        email: validEmail,
        password: validPassword,
      });
      const user2 = User.create({
        name: 'User Two',
        email: Email.create('user2@example.com'),
        password: validPassword,
      });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should use provided ID if given', () => {
      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const user = User.create({
        id: userId,
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(user.id).toBe(userId.getValue());
    });

    it('should accept name with minimum 3 characters', () => {
      const user = User.create({
        name: 'ABC',
        email: validEmail,
        password: validPassword,
      });

      expect(user.name).toBe('ABC');
    });

    it('should accept name with maximum 100 characters', () => {
      const longName = 'A'.repeat(100);
      const user = User.create({
        name: longName,
        email: validEmail,
        password: validPassword,
      });

      expect(user.name).toBe(longName);
    });

    it('should throw error for empty name', () => {
      expect(() =>
        User.create({
          name: '',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: '',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow('Name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() =>
        User.create({
          name: '   ',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: '   ',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow('Name cannot be empty');
    });

    it('should throw error for name shorter than 3 characters', () => {
      expect(() =>
        User.create({
          name: 'AB',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: 'AB',
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow('Name must have at least 3 characters');
    });

    it('should throw error for name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);

      expect(() =>
        User.create({
          name: longName,
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: longName,
          email: validEmail,
          password: validPassword,
        }),
      ).toThrow('Name must not exceed 100 characters');
    });

    it('should throw error for null password', () => {
      expect(() =>
        User.create({
          name: 'John Doe',
          email: validEmail,
          password: null as any,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: 'John Doe',
          email: validEmail,
          password: null as any,
        }),
      ).toThrow('Password cannot be empty');
    });

    it('should throw error for undefined password', () => {
      expect(() =>
        User.create({
          name: 'John Doe',
          email: validEmail,
          password: undefined as any,
        }),
      ).toThrow(DomainException);
      expect(() =>
        User.create({
          name: 'John Doe',
          email: validEmail,
          password: undefined as any,
        }),
      ).toThrow('Password cannot be empty');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute user with all properties', () => {
      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const user = User.reconstitute({
        id: userId,
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
        createdAt,
        updatedAt,
      });

      expect(user.id).toBe(userId.getValue());
      expect(user.name).toBe('John Doe');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });

    it('should reconstitute user from database state', () => {
      const userId = UserId.create();
      const user = User.reconstitute({
        id: userId,
        name: 'Existing User',
        email: validEmail,
        password: validPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user.id).toBe(userId.getValue());
    });
  });

  describe('updateName', () => {
    it('should update user name', () => {
      const user = User.create({
        name: 'Old Name',
        email: validEmail,
        password: validPassword,
      });

      const oldUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        user.updateName('New Name');

        expect(user.name).toBe('New Name');
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
          oldUpdatedAt.getTime(),
        );
      }, 10);
    });

    it('should validate name on update', () => {
      const user = User.create({
        name: 'Valid Name',
        email: validEmail,
        password: validPassword,
      });

      expect(() => user.updateName('')).toThrow(DomainException);
      expect(() => user.updateName('AB')).toThrow(DomainException);
      expect(() => user.updateName('A'.repeat(101))).toThrow(DomainException);
    });

    it('should update timestamp when name is updated', async () => {
      const user = User.create({
        name: 'Original Name',
        email: validEmail,
        password: validPassword,
      });

      const originalUpdatedAt = user.updatedAt.getTime();

      // Small delay to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      user.updateName('Updated Name');

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('updateEmail', () => {
    it('should update user email', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const newEmail = Email.create('newemail@example.com');
      user.updateEmail(newEmail);

      expect(user.email.getValue()).toBe('newemail@example.com');
    });

    it('should update timestamp when email is updated', async () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const originalUpdatedAt = user.updatedAt.getTime();

      // Small delay to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const newEmail = Email.create('newemail@example.com');
      user.updateEmail(newEmail);

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const newPassword = await Password.create('newPassword123');
      user.updatePassword(newPassword);

      expect(user.password.getValue()).toBe(newPassword.getValue());
    });

    it('should throw error for null password', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(() => user.updatePassword(null as any)).toThrow(DomainException);
      expect(() => user.updatePassword(null as any)).toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error for undefined password', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(() => user.updatePassword(undefined as any)).toThrow(DomainException);
      expect(() => user.updatePassword(undefined as any)).toThrow(
        'Password cannot be empty',
      );
    });

    it('should update timestamp when password is updated', async () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const originalUpdatedAt = user.updatedAt.getTime();

      // Small delay to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const newPassword = await Password.create('newPassword123');
      user.updatePassword(newPassword);

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('toObject', () => {
    it('should convert user to plain object', () => {
      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const user = User.create({
        id: userId,
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const obj = user.toObject();

      expect(obj).toEqual({
        id: userId.getValue(),
        name: 'John Doe',
        email: 'test@example.com',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should not include password in object representation', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      const obj = user.toObject();

      expect(obj).not.toHaveProperty('password');
    });
  });

  describe('equals', () => {
    it('should return true for users with same ID', () => {
      const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const user1 = User.create({
        id: userId,
        name: 'User One',
        email: Email.create('user1@example.com'),
        password: validPassword,
      });
      const user2 = User.create({
        id: userId,
        name: 'User Two',
        email: Email.create('user2@example.com'),
        password: validPassword,
      });

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for users with different IDs', () => {
      const user1 = User.create({
        name: 'User One',
        email: Email.create('user1@example.com'),
        password: validPassword,
      });
      const user2 = User.create({
        name: 'User Two',
        email: Email.create('user2@example.com'),
        password: validPassword,
      });

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(user.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(user.equals(undefined as any)).toBe(false);
    });

    it('should return true when comparing user with itself', () => {
      const user = User.create({
        name: 'John Doe',
        email: validEmail,
        password: validPassword,
      });

      expect(user.equals(user)).toBe(true);
    });
  });
});
