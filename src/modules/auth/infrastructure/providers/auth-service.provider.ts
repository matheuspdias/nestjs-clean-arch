import { Provider } from '@nestjs/common';
import { AUTH_SERVICE } from '../../domain/repositories/auth.repository';
import { JwtAuthService } from '../services/jwt-auth.service';

export const AuthServiceProvider: Provider = {
  provide: AUTH_SERVICE,
  useClass: JwtAuthService,
};
