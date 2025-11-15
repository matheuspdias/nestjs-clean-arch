import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidValueObjectException extends DomainException {
  constructor(field: string, value: any, reason?: string) {
    const message = reason
      ? `Invalid ${field}: ${value}. ${reason}`
      : `Invalid ${field}: ${value}`;
    super(message, HttpStatus.BAD_REQUEST);
  }
}
