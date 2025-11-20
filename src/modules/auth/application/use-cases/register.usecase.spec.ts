/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RegisterUseCase } from './register.usecase';
import { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { IAuthService } from '../../domain/repositories/auth.repository';
import { RegisterDto } from '../dto/request/register.dto';
import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { User } from '../../../user/domain/entities/user.entity';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockAuthService: jest.Mocked<IAuthService>;

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

    mockAuthService = {
      validateUser: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    useCase = new RegisterUseCase(mockUserRepository, mockAuthService);
  });

  describe('execute', () => {
    it('should register a new user and return auth tokens', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const tokens = {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockResolvedValue(tokens);

      const result = await useCase.execute(registerDto);

      expect(result).toEqual({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: 'Bearer',
      });
    });

    it('should check if email already exists before creating user', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
    });

    it('should throw DomainException when email already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(registerDto)).rejects.toThrow(
        DomainException,
      );
      await expect(useCase.execute(registerDto)).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should not save user when email already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(registerDto)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should save user to repository', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
        }),
      );
    });

    it('should hash password before saving user', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'plainPassword123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      let savedUser: User | null = null;
      mockUserRepository.save.mockImplementation((user: User) => {
        savedUser = user;
        return Promise.resolve(user);
      });
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(savedUser).toBeDefined();
      expect(savedUser!.password.getValue()).not.toBe('plainPassword123');
      // Should be bcrypt hash
      expect(savedUser!.password.getValue()).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should normalize email to lowercase', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      let savedUser: User | null = null;
      mockUserRepository.save.mockImplementation((user: User) => {
        savedUser = user;
        return Promise.resolve(user);
      });
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(savedUser).toBeDefined();
      expect(savedUser!.email.getValue()).toBe('john@example.com');
    });

    it('should generate tokens for newly created user', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(mockAuthService.generateTokens).toHaveBeenCalledTimes(1);
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('should return Bearer as token type', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      const result = await useCase.execute(registerDto);

      expect(result.tokenType).toBe('Bearer');
    });

    it('should validate user data before saving', async () => {
      const invalidDto: RegisterDto = {
        name: 'AB', // Too short
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        DomainException,
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should handle repository save errors', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(registerDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should handle token generation errors', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.save.mockImplementation((user: User) =>
        Promise.resolve(user),
      );
      mockAuthService.generateTokens.mockRejectedValue(
        new Error('Token generation failed'),
      );

      await expect(useCase.execute(registerDto)).rejects.toThrow(
        'Token generation failed',
      );
    });

    it('should create user with generated UUID', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      let savedUser: User | null = null;
      mockUserRepository.save.mockImplementation((user: User) => {
        savedUser = user;
        return Promise.resolve(user);
      });
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(savedUser).toBeDefined();
      expect(savedUser!.id).toBeDefined();
      expect(savedUser!.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const registerDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.existsByEmail.mockResolvedValue(false);

      let savedUser: User | null = null;
      mockUserRepository.save.mockImplementation((user: User) => {
        savedUser = user;
        return Promise.resolve(user);
      });
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(registerDto);

      expect(savedUser).toBeDefined();
      expect(savedUser!.createdAt).toBeInstanceOf(Date);
      expect(savedUser!.updatedAt).toBeInstanceOf(Date);
    });
  });
});
