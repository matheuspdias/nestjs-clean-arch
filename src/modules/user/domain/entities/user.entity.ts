import { BaseEntity } from '../../../../shared/base/base.entity';
import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface UserProps {
  id?: UserId;
  name: string;
  email: Email;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private _name: string;
  private _email: Email;
  private _password: string;

  private constructor(props: UserProps) {
    super(
      props.id?.getValue() || UserId.create().getValue(),
      props.createdAt,
      props.updatedAt,
    );
    this._name = props.name;
    this._email = props.email;
    this._password = props.password;
    this.validate();
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainException('Name cannot be empty');
    }

    if (this._name.length < 3) {
      throw new DomainException('Name must have at least 3 characters');
    }

    if (this._name.length > 100) {
      throw new DomainException('Name must not exceed 100 characters');
    }

    if (!this._password || this._password.length < 6) {
      throw new DomainException('Password must have at least 6 characters');
    }
  }

  get name(): string {
    return this._name;
  }

  get email(): Email {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  updateName(name: string): void {
    this._name = name;
    this.validate();
    this.touch();
  }

  updateEmail(email: Email): void {
    this._email = email;
    this.touch();
  }

  updatePassword(password: string): void {
    if (!password || password.length < 6) {
      throw new DomainException('Password must have at least 6 characters');
    }
    this._password = password;
    this.touch();
  }

  toObject() {
    return {
      id: this.id,
      name: this._name,
      email: this._email.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
