import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';

export class AccessToken {
  private readonly value: string;

  private constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  static create(value: string): AccessToken {
    return new AccessToken(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new InvalidValueObjectException(
        'accessToken',
        value,
        'Access token cannot be empty',
      );
    }

    // JWT format validation (header.payload.signature)
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!jwtPattern.test(value)) {
      throw new InvalidValueObjectException(
        'accessToken',
        value,
        'Invalid JWT token format',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AccessToken): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}
