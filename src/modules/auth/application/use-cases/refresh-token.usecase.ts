import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUseCase } from '../../../../shared/base/base.usecase';
import type { IAuthService } from '../../domain/repositories/auth.repository';
import { AUTH_SERVICE } from '../../domain/repositories/auth.repository';
import { RefreshTokenDto } from '../dto/request/refresh-token.dto';

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

@Injectable()
export class RefreshTokenUseCase
  implements IUseCase<RefreshTokenDto, RefreshTokenResponse>
{
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(request: RefreshTokenDto): Promise<RefreshTokenResponse> {
    try {
      const tokens = await this.authService.refreshAccessToken(
        request.refreshToken,
      );

      return {
        ...tokens,
        tokenType: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
