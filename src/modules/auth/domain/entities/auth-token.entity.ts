import { AccessToken } from '../value-objects/access-token.vo';
import { RefreshToken } from '../value-objects/refresh-token.vo';

export interface AuthTokenProps {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
  expiresIn: number;
}

export class AuthToken {
  private readonly _accessToken: AccessToken;
  private readonly _refreshToken: RefreshToken;
  private readonly _expiresIn: number;

  private constructor(props: AuthTokenProps) {
    this._accessToken = props.accessToken;
    this._refreshToken = props.refreshToken;
    this._expiresIn = props.expiresIn;
  }

  static create(props: AuthTokenProps): AuthToken {
    return new AuthToken(props);
  }

  get accessToken(): AccessToken {
    return this._accessToken;
  }

  get refreshToken(): RefreshToken {
    return this._refreshToken;
  }

  get expiresIn(): number {
    return this._expiresIn;
  }

  toObject() {
    return {
      accessToken: this._accessToken.getValue(),
      refreshToken: this._refreshToken.getValue(),
      expiresIn: this._expiresIn,
    };
  }
}
