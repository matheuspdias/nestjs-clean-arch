import { JwtService } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';
import { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { User } from '../../../user/domain/entities/user.entity';
import { Email } from '../../../user/domain/value-objects/email.vo';
import { Password } from '../../../user/domain/value-objects/password.vo';
import { UserId } from '../../../user/domain/value-objects/user-id.vo';

describe('JwtAuthService', () => {
  let service: JwtAuthService;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    };

    service = new JwtAuthService(mockJwtService, mockUserRepository);
  });

  describe('validateUser', () => {
    it('should return user id when credentials are valid', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await Password.create(plainPassword);
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'john@example.com',
        plainPassword,
      );

      expect(result).toBe(user.id);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
    });

    it('should return null when user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const hashedPassword = await Password.create('correctPassword');
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);

      const result = await service.validateUser(
        'john@example.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });

    it('should normalize email to lowercase', async () => {
      const hashedPassword = await Password.create('password123');
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: hashedPassword,
      });

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await service.validateUser('JOHN@EXAMPLE.COM', 'password123');

      const calledEmail = mockUserRepository.findByEmail.mock.calls[0][0];
      expect(calledEmail.getValue()).toBe('john@example.com');
    });

    it('should handle repository errors', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        service.validateUser('john@example.com', 'password123'),
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const userId = 'test-user-id';
      const accessToken = 'access-token-value';
      const refreshToken = 'refresh-token-value';

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.generateTokens(userId);

      expect(result).toEqual({
        accessToken,
        refreshToken,
        expiresIn: 3600,
      });
    });

    it('should call signAsync with correct payload for access token', async () => {
      const userId = 'test-user-id';

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.generateTokens(userId);

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: userId },
        { expiresIn: '1h' },
      );
    });

    it('should call signAsync with correct payload for refresh token', async () => {
      const userId = 'test-user-id';

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.generateTokens(userId);

      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: userId },
        { expiresIn: '7d' },
      );
    });

    it('should return expiresIn as 3600 seconds (1 hour)', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.generateTokens('test-user-id');

      expect(result.expiresIn).toBe(3600);
    });

    it('should handle JWT service errors', async () => {
      mockJwtService.signAsync.mockRejectedValue(
        new Error('JWT signing failed'),
      );

      await expect(service.generateTokens('test-user-id')).rejects.toThrow(
        'JWT signing failed',
      );
    });
  });

  describe('validateToken', () => {
    it('should return userId when token is valid', async () => {
      const userId = 'test-user-id';
      mockJwtService.verifyAsync.mockResolvedValue({ sub: userId });

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({ userId });
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    });

    it('should return null when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const result = await service.validateToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Token has expired'),
      );

      const result = await service.validateToken('expired-token');

      expect(result).toBeNull();
    });

    it('should return null when token is malformed', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Malformed token'),
      );

      const result = await service.validateToken('malformed-token');

      expect(result).toBeNull();
    });

    it('should handle any verification error gracefully', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Unexpected error'),
      );

      const result = await service.validateToken('some-token');

      expect(result).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from valid refresh token', async () => {
      const userId = 'test-user-id';
      const newAccessToken = 'new-access-token';

      mockJwtService.verifyAsync.mockResolvedValue({ sub: userId });
      mockJwtService.signAsync.mockResolvedValue(newAccessToken);

      const result = await service.refreshAccessToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: newAccessToken,
        expiresIn: 3600,
      });
    });

    it('should verify refresh token before generating new access token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'test-user-id' });
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      await service.refreshAccessToken('refresh-token');

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('refresh-token');
    });

    it('should sign new access token with correct payload', async () => {
      const userId = 'test-user-id';

      mockJwtService.verifyAsync.mockResolvedValue({ sub: userId });
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      await service.refreshAccessToken('refresh-token');

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId },
        { expiresIn: '1h' },
      );
    });

    it('should return expiresIn as 3600 seconds', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'test-user-id' });
      mockJwtService.signAsync.mockResolvedValue('new-access-token');

      const result = await service.refreshAccessToken('refresh-token');

      expect(result.expiresIn).toBe(3600);
    });

    it('should throw error when refresh token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.refreshAccessToken('invalid-refresh-token'),
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error when refresh token is expired', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(
        new Error('Token has expired'),
      );

      await expect(
        service.refreshAccessToken('expired-refresh-token'),
      ).rejects.toThrow('Token has expired');
    });

    it('should throw error when signing new access token fails', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'test-user-id' });
      mockJwtService.signAsync.mockRejectedValue(new Error('Signing failed'));

      await expect(service.refreshAccessToken('refresh-token')).rejects.toThrow(
        'Signing failed',
      );
    });
  });
});
