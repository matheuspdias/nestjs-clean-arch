import * as bcrypt from 'bcrypt';
import { DomainException } from '../../../../shared/exceptions/domain.exception';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Creates a Password value object from a plain text password
   * Hashes the password using bcrypt
   */
  static async create(plainPassword: string): Promise<Password> {
    this.validate(plainPassword);
    const hashedValue = await bcrypt.hash(plainPassword, 10);
    return new Password(hashedValue);
  }

  /**
   * Creates a Password value object from an already hashed password
   * Used when loading from database
   */
  static fromHash(hashedValue: string): Password {
    if (!hashedValue || hashedValue.trim().length === 0) {
      throw new DomainException('Password hash cannot be empty');
    }
    return new Password(hashedValue);
  }

  /**
   * Validates plain password before hashing
   */
  private static validate(plainPassword: string): void {
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new DomainException('Password cannot be empty');
    }

    if (plainPassword.length < 6) {
      throw new DomainException('Password must be at least 6 characters long');
    }

    if (plainPassword.length > 100) {
      throw new DomainException('Password cannot exceed 100 characters');
    }
  }

  /**
   * Compares a plain text password with the hashed password
   */
  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  /**
   * Returns the hashed password value
   */
  getValue(): string {
    return this.hashedValue;
  }

  /**
   * Checks if two Password objects are equal
   */
  equals(other: Password): boolean {
    if (!other) {
      return false;
    }
    return this.hashedValue === other.hashedValue;
  }
}
