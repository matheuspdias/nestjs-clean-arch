import { EntityNotFoundException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { DeleteUserUseCase } from './delete-user.usecase';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUser: User;
  const userId = '550e8400-e29b-41d4-a716-446655440000';

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

    useCase = new DeleteUserUseCase(mockUserRepository);

    mockUser = User.create({
      id: UserId.create(userId),
      name: 'John Doe',
      email: Email.create('john@example.com'),
      password: await Password.create('password123'),
    });
  });

  describe('execute', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(userId);

      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should verify user exists before deleting', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(
        EntityNotFoundException,
      );

      await expect(useCase.execute(userId)).rejects.toThrow(
        `User with id ${userId} not found`,
      );

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error with correct userId in message', async () => {
      const nonExistentId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockUserRepository.findById.mockResolvedValue(null);

      try {
        await useCase.execute(nonExistentId);
        fail('Should have thrown EntityNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityNotFoundException);
        expect(error.message).toContain(nonExistentId);
      }
    });

    it('should not throw error when deletion is successful', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute(userId)).resolves.not.toThrow();
    });

    it('should return void on successful deletion', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      const result = await useCase.execute(userId);

      expect(result).toBeUndefined();
    });

    it('should handle repository errors on findById', async () => {
      mockUserRepository.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(userId)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors on delete', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockRejectedValue(
        new Error('Delete operation failed'),
      );

      await expect(useCase.execute(userId)).rejects.toThrow(
        'Delete operation failed',
      );
    });

    it('should delete user with any valid UUID', async () => {
      const differentUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const differentUser = User.create({
        id: UserId.create(differentUserId),
        name: 'Jane Doe',
        email: Email.create('jane@example.com'),
        password: await Password.create('password456'),
      });

      mockUserRepository.findById.mockResolvedValue(differentUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(differentUserId);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(differentUserId);
    });
  });
});
