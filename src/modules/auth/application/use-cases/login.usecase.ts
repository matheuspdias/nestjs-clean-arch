import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/base/base.usecase';
import type { IAuthService } from '../../domain/repositories/auth.repository';
import { AUTH_SERVICE } from '../../domain/repositories/auth.repository';
import { LoginDto } from '../dto/request/login.dto';
import { AuthResponseDto } from '../dto/response/auth-response.dto';
import { AccessToken } from '../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../domain/value-objects/refresh-token.vo';
import { AuthToken } from '../../domain/entities/auth-token.entity';

@Injectable()
export class LoginUseCase implements IUseCase<LoginDto, AuthResponseDto> {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(request: LoginDto): Promise<AuthResponseDto> {
    // Validate user credentials
    const userId = await this.authService.validateUser(
      request.email,
      request.password,
    );

    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.authService.generateTokens(userId);

    // Create domain entities
    const authToken = AuthToken.create({
      accessToken: AccessToken.create(tokens.accessToken),
      refreshToken: RefreshToken.create(tokens.refreshToken),
      expiresIn: tokens.expiresIn,
    });

    // Return response DTO
    return {
      ...authToken.toObject(),
      tokenType: 'Bearer',
    };
  }
}
