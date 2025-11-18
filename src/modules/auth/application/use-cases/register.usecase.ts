import { Inject, Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../shared/base/base.usecase';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../user/domain/repositories/user.repository';
import type { IAuthService } from '../../domain/repositories/auth.repository';
import { AUTH_SERVICE } from '../../domain/repositories/auth.repository';
import { RegisterDto } from '../dto/request/register.dto';
import { AuthResponseDto } from '../dto/response/auth-response.dto';
import { User } from '../../../user/domain/entities/user.entity';
import { Email } from '../../../user/domain/value-objects/email.vo';
import { Password } from '../../../user/domain/value-objects/password.vo';
import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { AccessToken } from '../../domain/value-objects/access-token.vo';
import { RefreshToken } from '../../domain/value-objects/refresh-token.vo';
import { AuthToken } from '../../domain/entities/auth-token.entity';

@Injectable()
export class RegisterUseCase implements IUseCase<RegisterDto, AuthResponseDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  async execute(request: RegisterDto): Promise<AuthResponseDto> {
    // Create email value object for validation
    const emailVO = Email.create(request.email);

    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(emailVO);
    if (emailExists) {
      throw new DomainException('Email already in use');
    }

    // Create value objects (reuse emailVO already created)
    const password = await Password.create(request.password);

    // Create user entity
    const user = User.create({
      name: request.name,
      email: emailVO,
      password,
    });

    // Save user
    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.authService.generateTokens(savedUser.id);

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
