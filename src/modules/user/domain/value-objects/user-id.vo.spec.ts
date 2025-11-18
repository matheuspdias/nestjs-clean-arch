import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';
import { UserId } from './user-id.vo';

describe('UserId Value Object', () => {
  describe('create', () => {
    it('should create a UserId with generated UUID when no value provided', () => {
      const userId = UserId.create();

      expect(userId).toBeDefined();
      expect(userId.getValue()).toBeDefined();
      expect(userId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should create different UUIDs for each call', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();

      expect(userId1.getValue()).not.toBe(userId2.getValue());
    });

    it('should create a UserId with provided valid UUID', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = UserId.create(validUuid);

      expect(userId.getValue()).toBe(validUuid);
    });

    it('should accept valid UUID v4', () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      validUuids.forEach((uuid) => {
        const userId = UserId.create(uuid);
        expect(userId.getValue()).toBe(uuid);
      });
    });

    it('should throw error for invalid UUID format', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123',
        'invalid-format-here',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-41d4-a716-446655440000-extra',
      ];

      invalidUuids.forEach((invalidUuid) => {
        expect(() => UserId.create(invalidUuid)).toThrow(
          InvalidValueObjectException,
        );
        expect(() => UserId.create(invalidUuid)).toThrow('Must be a valid UUID');
      });
    });

    it('should generate UUID for empty string', () => {
      const userId = UserId.create('');

      expect(userId).toBeDefined();
      expect(userId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('getValue', () => {
    it('should return the UUID value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = UserId.create(uuid);

      expect(userId.getValue()).toBe(uuid);
    });
  });

  describe('equals', () => {
    it('should return true for UserIds with same value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId1 = UserId.create(uuid);
      const userId2 = UserId.create(uuid);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for UserIds with different values', () => {
      const userId1 = UserId.create('550e8400-e29b-41d4-a716-446655440000');
      const userId2 = UserId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479');

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false for generated UserIds', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();

      expect(userId1.equals(userId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return UUID as string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const userId = UserId.create(uuid);

      expect(userId.toString()).toBe(uuid);
    });

    it('should return generated UUID as string', () => {
      const userId = UserId.create();

      expect(userId.toString()).toBe(userId.getValue());
    });
  });
});
