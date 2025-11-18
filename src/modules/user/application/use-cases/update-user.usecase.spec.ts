import {
  DomainException,
  EntityNotFoundException,
} from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UpdateUserDto } from '../dto/request/update-user.dto';
import { UpdateUserRequest, UpdateUserUseCase } from './update-user.usecase';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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

    useCase = new UpdateUserUseCase(mockUserRepository);

    mockUser = User.create({
      id: UserId.create(userId),
      name: 'John Doe',
      email: Email.create('john@example.com'),
      password: await Password.create('password123'),
    });
  });

  describe('execute', () => {
    it('should update user name successfully', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const result = await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(result.name).toBe('Jane Doe');
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update user email successfully', async () => {
      const updateDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const result = await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(result.email).toBe('newemail@example.com');
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update user password successfully', async () => {
      const updateDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const result = await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(result).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      // Password should not be in response
      expect(result).not.toHaveProperty('password');
    });

    it('should update multiple fields at once', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const result = await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
    });

    it('should throw EntityNotFoundException when user not found', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Jane Doe',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow(EntityNotFoundException);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error if new email already exists', async () => {
      const updateDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow(DomainException);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow('Email already in use');

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should not check email uniqueness if email is not being changed', async () => {
      const updateDto: UpdateUserDto = {
        email: 'john@example.com', // Same email
        name: 'Updated Name',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
    });

    it('should check email uniqueness only if email is different', async () => {
      const updateDto: UpdateUserDto = {
        email: 'different@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledTimes(1);
    });

    it('should validate updated name', async () => {
      const updateDto: UpdateUserDto = {
        name: 'AB', // Too short
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow(DomainException);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should validate updated email format', async () => {
      const updateDto: UpdateUserDto = {
        email: 'invalid-email',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow();

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should validate updated password', async () => {
      const updateDto: UpdateUserDto = {
        password: '12345', // Too short
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow(DomainException);

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should hash new password', async () => {
      const updateDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      let updatedUser: User;
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockImplementation(async (user: User) => {
        updatedUser = user;
        return user;
      });

      await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(updatedUser.password.getValue()).not.toBe('newPassword123');
      expect(updatedUser.password.getValue()).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should convert email to lowercase', async () => {
      const updateDto: UpdateUserDto = {
        email: 'NEWEMAIL@EXAMPLE.COM',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const result = await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(result.email).toBe('newemail@example.com');
    });

    it('should handle repository errors', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        useCase.execute({
          userId,
          data: updateDto,
        }),
      ).rejects.toThrow('Database connection failed');
    });

    it('should update timestamps when user is updated', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockImplementation(async (user: User) => user);

      const originalUpdatedAt = mockUser.updatedAt.getTime();

      // Small delay to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await useCase.execute({
        userId,
        data: updateDto,
      });

      expect(mockUser.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });
});
