import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { Password } from './password.vo';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid password', async () => {
      const password = await Password.create('validPassword123');

      expect(password).toBeDefined();
      expect(password.getValue()).toBeDefined();
      expect(password.getValue().length).toBeGreaterThan(0);
    });

    it('should hash the password', async () => {
      const plainPassword = 'mySecretPassword';
      const password = await Password.create(plainPassword);

      expect(password.getValue()).not.toBe(plainPassword);
      expect(password.getValue()).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should create different hashes for the same password', async () => {
      const plainPassword = 'samePassword123';
      const password1 = await Password.create(plainPassword);
      const password2 = await Password.create(plainPassword);

      // Different hashes due to different salts
      expect(password1.getValue()).not.toBe(password2.getValue());
    });

    it('should throw error for empty password', async () => {
      await expect(Password.create('')).rejects.toThrow(DomainException);
      await expect(Password.create('')).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error for whitespace-only password', async () => {
      await expect(Password.create('   ')).rejects.toThrow(DomainException);
      await expect(Password.create('   ')).rejects.toThrow(
        'Password cannot be empty',
      );
    });

    it('should throw error for password shorter than 6 characters', async () => {
      await expect(Password.create('12345')).rejects.toThrow(DomainException);
      await expect(Password.create('12345')).rejects.toThrow(
        'Password must be at least 6 characters long',
      );
    });

    it('should throw error for password exceeding 100 characters', async () => {
      const longPassword = 'a'.repeat(101);

      await expect(Password.create(longPassword)).rejects.toThrow(
        DomainException,
      );
      await expect(Password.create(longPassword)).rejects.toThrow(
        'Password cannot exceed 100 characters',
      );
    });

    it('should accept password with exactly 6 characters', async () => {
      const password = await Password.create('123456');

      expect(password).toBeDefined();
    });

    it('should accept password with exactly 100 characters', async () => {
      const maxPassword = 'a'.repeat(100);
      const password = await Password.create(maxPassword);

      expect(password).toBeDefined();
    });
  });

  describe('fromHash', () => {
    it('should create password from valid hash', () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM';
      const password = Password.fromHash(hash);

      expect(password).toBeDefined();
      expect(password.getValue()).toBe(hash);
    });

    it('should throw error for empty hash', () => {
      expect(() => Password.fromHash('')).toThrow(DomainException);
      expect(() => Password.fromHash('')).toThrow(
        'Password hash cannot be empty',
      );
    });

    it('should throw error for whitespace-only hash', () => {
      expect(() => Password.fromHash('   ')).toThrow(DomainException);
      expect(() => Password.fromHash('   ')).toThrow(
        'Password hash cannot be empty',
      );
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'myPassword123';
      const password = await Password.create(plainPassword);

      const result = await password.compare(plainPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = await Password.create('correctPassword');

      const result = await password.compare('wrongPassword');

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = await Password.create('Password123');

      const result = await password.compare('password123');

      expect(result).toBe(false);
    });

    it('should work with password created from hash', async () => {
      const plainPassword = 'testPassword';
      const originalPassword = await Password.create(plainPassword);
      const hash = originalPassword.getValue();

      const passwordFromHash = Password.fromHash(hash);
      const result = await passwordFromHash.compare(plainPassword);

      expect(result).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for passwords with same hash', async () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM';
      const password1 = Password.fromHash(hash);
      const password2 = Password.fromHash(hash);

      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for passwords with different hashes', async () => {
      const password1 = await Password.create('password123');
      const password2 = await Password.create('password123');

      // Different hashes due to different salts
      expect(password1.equals(password2)).toBe(false);
    });

    it('should return false when comparing with null', async () => {
      const password = await Password.create('password123');

      expect(password.equals(null)).toBe(false);
    });

    it('should return false when comparing with undefined', async () => {
      const password = await Password.create('password123');

      expect(password.equals(undefined)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the hashed value', async () => {
      const password = await Password.create('myPassword');
      const hash = password.getValue();

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt hash format
    });

    it('should return the same hash when created from hash', () => {
      const originalHash =
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      const password = Password.fromHash(originalHash);

      expect(password.getValue()).toBe(originalHash);
    });
  });
});
