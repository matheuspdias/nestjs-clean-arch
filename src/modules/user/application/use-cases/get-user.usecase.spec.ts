import { EntityNotFoundException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { GetUserUseCase } from './get-user.usecase';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUser: User;

  beforeEach(async () => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    };

    useCase = new GetUserUseCase(mockUserRepository);

    // Create a mock user for tests
    mockUser = User.create({
      id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'John Doe',
      email: Email.create('john@example.com'),
      password: await Password.create('password123'),
    });
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBeDefined();
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should not include password in response', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      expect(result).not.toHaveProperty('password');
    });

    it('should call repository findById with correct userId', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow(EntityNotFoundException);

      await expect(
        useCase.execute('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow('User with id 550e8400-e29b-41d4-a716-446655440000 not found');
    });

    it('should throw EntityNotFoundException with correct message', async () => {
      const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(userId);
        fail('Should have thrown EntityNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundException);
        expect(error.message).toContain('User');
        expect(error.message).toContain(userId);
      }
    });

    it('should handle repository errors', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        useCase.execute('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow('Database connection failed');
    });

    it('should return user with all required fields', async () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const userWithDates = User.reconstitute({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
        createdAt,
        updatedAt,
      });

      mockUserRepository.findById.mockResolvedValue(userWithDates);

      const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
    });
  });
});
