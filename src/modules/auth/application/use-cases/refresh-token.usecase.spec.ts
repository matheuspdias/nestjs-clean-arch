/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { IAuthService } from '../../domain/repositories/auth.repository';
import { RefreshTokenDto } from '../dto/request/refresh-token.dto';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let mockAuthService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockAuthService = {
      validateUser: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(mockAuthService);
  });

  describe('execute', () => {
    it('should return new access token when refresh token is valid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const newTokens = {
        accessToken: 'new-access-token',
        expiresIn: 3600,
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(newTokens);

      const result = await useCase.execute(refreshTokenDto);

      expect(result).toEqual({
        accessToken: newTokens.accessToken,
        expiresIn: newTokens.expiresIn,
        tokenType: 'Bearer',
      });
    });

    it('should call refreshAccessToken with correct refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-token',
        expiresIn: 3600,
      });

      await useCase.execute(refreshTokenDto);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it('should return Bearer as token type', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-token',
        expiresIn: 3600,
      });

      const result = await useCase.execute(refreshTokenDto);

      expect(result.tokenType).toBe('Bearer');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'expired-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is malformed', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'malformed-token',
      };

      mockAuthService.refreshAccessToken.mockRejectedValue(
        new Error('Malformed token'),
      );

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle any error from auth service and convert to UnauthorizedException', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'some-token',
      };

      mockAuthService.refreshAccessToken.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should return correct expiresIn value', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-token',
        expiresIn: 3600,
      });

      const result = await useCase.execute(refreshTokenDto);

      expect(result.expiresIn).toBe(3600);
    });

    it('should return new access token with correct format', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new';

      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: expectedToken,
        expiresIn: 3600,
      });

      const result = await useCase.execute(refreshTokenDto);

      expect(result.accessToken).toBe(expectedToken);
    });

    it('should preserve all properties from auth service response', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const authServiceResponse = {
        accessToken: 'new-access-token',
        expiresIn: 7200, // Different expiration
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(authServiceResponse);

      const result = await useCase.execute(refreshTokenDto);

      expect(result.accessToken).toBe(authServiceResponse.accessToken);
      expect(result.expiresIn).toBe(authServiceResponse.expiresIn);
    });
  });
});
