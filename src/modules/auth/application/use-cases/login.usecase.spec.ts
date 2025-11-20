/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.usecase';
import { IAuthService } from '../../domain/repositories/auth.repository';
import { LoginDto } from '../dto/request/login.dto';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockAuthService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockAuthService = {
      validateUser: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    useCase = new LoginUseCase(mockAuthService);
  });

  describe('execute', () => {
    it('should return auth tokens when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const userId = 'test-user-id';
      const tokens = {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      };

      mockAuthService.validateUser.mockResolvedValue(userId);
      mockAuthService.generateTokens.mockResolvedValue(tokens);

      const result = await useCase.execute(loginDto);

      expect(result).toEqual({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: 'Bearer',
      });
    });

    it('should call validateUser with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue('user-id');
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
      );
      expect(mockAuthService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should call generateTokens with userId after validation', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const userId = 'test-user-id';

      mockAuthService.validateUser.mockResolvedValue(userId);
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      await useCase.execute(loginDto);

      expect(mockAuthService.generateTokens).toHaveBeenCalledWith(userId);
      expect(mockAuthService.generateTokens).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should not call generateTokens when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow();
      expect(mockAuthService.generateTokens).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return Bearer as token type', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue('user-id');
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        expiresIn: 3600,
      });

      const result = await useCase.execute(loginDto);

      expect(result.tokenType).toBe('Bearer');
    });

    it('should handle auth service errors', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle token generation errors', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      mockAuthService.validateUser.mockResolvedValue('user-id');
      mockAuthService.generateTokens.mockRejectedValue(
        new Error('Token generation failed'),
      );

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        'Token generation failed',
      );
    });

    it('should create AuthToken domain entity with correct values', async () => {
      const loginDto: LoginDto = {
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

      mockAuthService.validateUser.mockResolvedValue('user-id');
      mockAuthService.generateTokens.mockResolvedValue(tokens);

      const result = await useCase.execute(loginDto);

      expect(result.accessToken).toBe(tokens.accessToken);
      expect(result.refreshToken).toBe(tokens.refreshToken);
      expect(result.expiresIn).toBe(tokens.expiresIn);
    });
  });
});
