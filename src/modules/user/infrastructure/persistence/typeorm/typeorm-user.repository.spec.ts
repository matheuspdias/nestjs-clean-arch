import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { Password } from '../../../domain/value-objects/password.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { TypeOrmUserModel } from './typeorm-user.model';
import { TypeOrmUserRepository } from './typeorm-user.repository';

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('TypeOrmUserRepository (Integration)', () => {
  let repository: TypeOrmUserRepository;
  let typeormRepository: Repository<TypeOrmUserModel>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [TypeOrmUserModel],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([TypeOrmUserModel]),
      ],
      providers: [TypeOrmUserRepository],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    typeormRepository = module.get('TypeOrmUserModelRepository');
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  beforeEach(async () => {
    await typeormRepository.clear();
  });

  describe('save', () => {
    it('should save a new user to database', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      const savedUser = await repository.save(user);

      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBe(user.id);
      expect(savedUser.name).toBe('John Doe');
      expect(savedUser.email.getValue()).toBe('john@example.com');
    });

    it('should persist user with all fields', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const found = await typeormRepository.findOne({
        where: { id: user.id },
      });

      expect(found).toBeDefined();
      expect(found.name).toBe('John Doe');
      expect(found.email).toBe('john@example.com');
      expect(found.password).toBeDefined();
      expect(found.createdAt).toBeDefined();
      expect(found.updatedAt).toBeDefined();
    });

    it('should save hashed password', async () => {
      const password = await Password.create('plainPassword');
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password,
      });

      await repository.save(user);

      const found = await typeormRepository.findOne({
        where: { id: user.id },
      });

      expect(found.password).not.toBe('plainPassword');
      expect(found.password).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should save multiple users', async () => {
      const user1 = User.create({
        name: 'User One',
        email: Email.create('user1@example.com'),
        password: await Password.create('password1'),
      });

      const user2 = User.create({
        name: 'User Two',
        email: Email.create('user2@example.com'),
        password: await Password.create('password2'),
      });

      await repository.save(user1);
      await repository.save(user2);

      const count = await typeormRepository.count();
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const found = await repository.findById(user.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(user.id);
      expect(found.name).toBe('John Doe');
      expect(found.email.getValue()).toBe('john@example.com');
    });

    it('should return null when user not found', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).toBeNull();
    });

    it('should reconstitute user with all properties', async () => {
      const password = await Password.create('password123');
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password,
      });

      await repository.save(user);

      const found = await repository.findById(user.id);

      expect(found.id).toBe(user.id);
      expect(found.name).toBe(user.name);
      expect(found.email.getValue()).toBe(user.email.getValue());
      expect(found.createdAt).toBeInstanceOf(Date);
      expect(found.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = Email.create('john@example.com');
      const user = User.create({
        name: 'John Doe',
        email,
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const found = await repository.findByEmail(email);

      expect(found).toBeDefined();
      expect(found.email.getValue()).toBe('john@example.com');
    });

    it('should return null when user not found by email', async () => {
      const email = Email.create('nonexistent@example.com');
      const found = await repository.findByEmail(email);

      expect(found).toBeNull();
    });

    it('should find user with case-insensitive email', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const found = await repository.findByEmail(
        Email.create('JOHN@EXAMPLE.COM'),
      );

      expect(found).toBeDefined();
      expect(found.email.getValue()).toBe('john@example.com');
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      const users = [
        User.create({
          name: 'User One',
          email: Email.create('user1@example.com'),
          password: await Password.create('password1'),
        }),
        User.create({
          name: 'User Two',
          email: Email.create('user2@example.com'),
          password: await Password.create('password2'),
        }),
        User.create({
          name: 'User Three',
          email: Email.create('user3@example.com'),
          password: await Password.create('password3'),
        }),
      ];

      for (const user of users) {
        await repository.save(user);
      }
    });

    it('should return paginated users', async () => {
      const result = await repository.findAll(1, 10);

      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should return correct page of users', async () => {
      const result = await repository.findAll(1, 2);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(3);
    });

    it('should return second page of users', async () => {
      const result = await repository.findAll(2, 2);

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(3);
    });

    it('should return empty array when page is out of range', async () => {
      const result = await repository.findAll(10, 10);

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(3);
    });

    it('should order users by createdAt DESC', async () => {
      const result = await repository.findAll(1, 10);

      // Most recent first
      expect(result.users[0].name).toBe('User Three');
      expect(result.users[1].name).toBe('User Two');
      expect(result.users[2].name).toBe('User One');
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      user.updateName('Jane Doe');
      const updated = await repository.update(user);

      expect(updated.name).toBe('Jane Doe');
    });

    it('should persist updated user', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      user.updateName('Jane Doe');
      await repository.update(user);

      const found = await typeormRepository.findOne({
        where: { id: user.id },
      });

      expect(found.name).toBe('Jane Doe');
    });

    it('should update email', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      user.updateEmail(Email.create('newemail@example.com'));
      const updated = await repository.update(user);

      expect(updated.email.getValue()).toBe('newemail@example.com');
    });

    it('should update password', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const newPassword = await Password.create('newPassword123');
      user.updatePassword(newPassword);
      await repository.update(user);

      const found = await typeormRepository.findOne({
        where: { id: user.id },
      });

      expect(found.password).toBe(newPassword.getValue());
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      await repository.delete(user.id);

      const found = await typeormRepository.findOne({
        where: { id: user.id },
      });

      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      const email = Email.create('john@example.com');
      const user = User.create({
        name: 'John Doe',
        email,
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const exists = await repository.existsByEmail(email);

      expect(exists).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      const email = Email.create('nonexistent@example.com');
      const exists = await repository.existsByEmail(email);

      expect(exists).toBe(false);
    });

    it('should be case-insensitive', async () => {
      const user = User.create({
        name: 'John Doe',
        email: Email.create('john@example.com'),
        password: await Password.create('password123'),
      });

      await repository.save(user);

      const exists = await repository.existsByEmail(
        Email.create('JOHN@EXAMPLE.COM'),
      );

      expect(exists).toBe(true);
    });
  });
});
