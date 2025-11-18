import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

// Use Cases
import { LoginUseCase } from './application/use-cases/login.usecase';
import { RegisterUseCase } from './application/use-cases/register.usecase';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.usecase';

// Services
import { JwtAuthService } from './infrastructure/services/jwt-auth.service';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Guards
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

// Providers
import { AuthServiceProvider } from './infrastructure/providers/auth-service.provider';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,

    // Services
    JwtAuthService,
    AuthServiceProvider,

    // Strategies
    JwtStrategy,

    // Guards
    JwtAuthGuard,
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
