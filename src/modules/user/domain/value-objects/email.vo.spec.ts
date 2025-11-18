import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';
import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');

      expect(email).toBeDefined();
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should convert email to lowercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should trim whitespace from email', () => {
      const email = Email.create(' test@example.com ');

      expect(email.getValue()).toBe('test@example.com');
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        'user123@test.org',
      ];

      validEmails.forEach((validEmail) => {
        const email = Email.create(validEmail);
        expect(email.getValue()).toBe(validEmail.toLowerCase());
      });
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow(InvalidValueObjectException);
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw error for whitespace-only email', () => {
      expect(() => Email.create('   ')).toThrow(InvalidValueObjectException);
      expect(() => Email.create('   ')).toThrow('Email cannot be empty');
    });

    it('should throw error for invalid email format', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@.com',
        'invalid@domain',
        'invalid @example.com',
        'invalid@exam ple.com',
      ];

      invalidEmails.forEach((invalidEmail) => {
        expect(() => Email.create(invalidEmail)).toThrow(
          InvalidValueObjectException,
        );
        expect(() => Email.create(invalidEmail)).toThrow(
          'Invalid email format',
        );
      });
    });

    it('should throw error for email exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';

      expect(() => Email.create(longEmail)).toThrow(
        InvalidValueObjectException,
      );
      expect(() => Email.create(longEmail)).toThrow(
        'Email must not exceed 255 characters',
      );
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for emails with different cases', () => {
      const email1 = Email.create('TEST@example.com');
      const email2 = Email.create('test@EXAMPLE.com');

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return email as string', () => {
      const email = Email.create('test@example.com');

      expect(email.toString()).toBe('test@example.com');
    });
  });
});
