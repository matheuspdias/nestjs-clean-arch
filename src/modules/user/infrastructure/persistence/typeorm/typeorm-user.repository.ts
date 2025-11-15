import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { TypeOrmUserModel } from './typeorm-user.model';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(TypeOrmUserModel)
    private readonly repository: Repository<TypeOrmUserModel>,
  ) {}

  async save(user: User): Promise<User> {
    const model = this.toModel(user);
    const saved = await this.repository.save(model);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const model = await this.repository.findOne({ where: { id } });
    return model ? this.toDomain(model) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const model = await this.repository.findOne({
      where: { email: email.getValue() },
    });
    return model ? this.toDomain(model) : null;
  }

  async findAll(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;

    const [models, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = models.map((model) => this.toDomain(model));

    return { users, total };
  }

  async update(user: User): Promise<User> {
    const model = this.toModel(user);
    const updated = await this.repository.save(model);
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  private toDomain(model: TypeOrmUserModel): User {
    return User.reconstitute({
      id: UserId.create(model.id),
      name: model.name,
      email: Email.create(model.email),
      password: Password.fromHash(model.password), // Load from hash
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  private toModel(user: User): TypeOrmUserModel {
    const model = new TypeOrmUserModel();
    model.id = user.id;
    model.name = user.name;
    model.email = user.email.getValue();
    model.password = user.password.getValue(); // Save hash to database
    model.createdAt = user.createdAt;
    model.updatedAt = user.updatedAt;
    return model;
  }
}
