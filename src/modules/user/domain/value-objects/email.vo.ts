import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    const trimmedValue = value?.trim() || '';
    this.validate(trimmedValue);
    this.value = trimmedValue.toLowerCase();
  }

  static create(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): void {
    if (!value || value.length === 0) {
      throw new InvalidValueObjectException(
        'Email',
        value,
        'Email cannot be empty',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new InvalidValueObjectException(
        'Email',
        value,
        'Invalid email format',
      );
    }

    if (value.length > 255) {
      throw new InvalidValueObjectException(
        'Email',
        value,
        'Email must not exceed 255 characters',
      );
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
