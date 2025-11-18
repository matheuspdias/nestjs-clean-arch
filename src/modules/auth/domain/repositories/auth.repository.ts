export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface IAuthService {
  /**
   * Validates user credentials
   * @param email User email
   * @param password Plain text password
   * @returns User ID if valid, null otherwise
   */
  validateUser(email: string, password: string): Promise<string | null>;

  /**
   * Generates JWT access and refresh tokens
   * @param userId User ID
   * @returns Object containing access token, refresh token, and expiration time
   */
  generateTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }>;

  /**
   * Validates and decodes a JWT token
   * @param token JWT token
   * @returns Decoded payload or null if invalid
   */
  validateToken(token: string): Promise<{ userId: string } | null>;

  /**
   * Refreshes access token using refresh token
   * @param refreshToken Refresh token
   * @returns New access token and expiration time
   */
  refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;
}
