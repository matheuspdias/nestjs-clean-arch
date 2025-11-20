import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from '../../domain/repositories/auth.repository';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../user/domain/repositories/user.repository';
import { Email } from '../../../user/domain/value-objects/email.vo';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtAuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async validateUser(email: string, password: string): Promise<string | null> {
    const emailVO = Email.create(email);
    const user = await this.userRepository.findByEmail(emailVO);

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.password.compare(password);

    if (!isPasswordValid) {
      return null;
    }

    return user.id;
  }

  async generateTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  async validateToken(token: string): Promise<{ userId: string } | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return { userId: payload.sub };
    } catch {
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub },
      {
        expiresIn: '1h',
      },
    );

    return {
      accessToken,
      expiresIn: 3600,
    };
  }
}
