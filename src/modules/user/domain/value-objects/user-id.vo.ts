import { InvalidValueObjectException } from '../../../../shared/exceptions/domain.exception';
import { UuidGenerator } from '../../../../shared/utils/uuid.generator';

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value?: string): UserId {
    if (value && !UuidGenerator.isValid(value)) {
      throw new InvalidValueObjectException(
        'UserId',
        value,
        'Must be a valid UUID',
      );
    }
    return new UserId(value || UuidGenerator.generate());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
