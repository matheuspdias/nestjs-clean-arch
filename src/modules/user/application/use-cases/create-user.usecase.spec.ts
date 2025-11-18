import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { CreateUserUseCase } from './create-user.usecase';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      // Password should not be in response
      expect(result).not.toHaveProperty('password');
    });

    it('should check if email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      await useCase.execute(dto);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
    });

    it('should throw error if email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(dto)).rejects.toThrow(DomainException);
      await expect(useCase.execute(dto)).rejects.toThrow(
        'Email already in use',
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'plainPassword123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      let savedUser: User;
      mockUserRepository.save.mockImplementation(async (user: User) => {
        savedUser = user;
        return user;
      });

      await useCase.execute(dto);

      expect(savedUser).toBeDefined();
      expect(savedUser.password.getValue()).not.toBe('plainPassword123');
      // Should be bcrypt hash
      expect(savedUser.password.getValue()).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should convert email to lowercase', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await useCase.execute(dto);

      expect(result.email).toBe('john@example.com');
    });

    it('should save user to repository', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      await useCase.execute(dto);

      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
        }),
      );
    });

    it('should generate unique ID for new user', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await useCase.execute(dto);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation(async (user: User) => user);

      const result = await useCase.execute(dto);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(
        result.updatedAt.getTime(),
      );
    });

    it('should validate user data before saving', async () => {
      const invalidDto: CreateUserDto = {
        name: 'AB', // Too short
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        DomainException,
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
