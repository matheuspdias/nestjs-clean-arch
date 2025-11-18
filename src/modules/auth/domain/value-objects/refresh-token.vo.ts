import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';

export class RefreshToken {
  private readonly value: string;

  private constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  static create(value: string): RefreshToken {
    return new RefreshToken(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidValueObjectException(
        'refreshToken',
        value,
        'Refresh token cannot be empty',
      );
    }

    // JWT format validation
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!jwtPattern.test(value)) {
      throw new InvalidValueObjectException(
        'refreshToken',
        value,
        'Invalid refresh token format',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: RefreshToken): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}
