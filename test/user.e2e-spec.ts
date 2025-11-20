/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestDatabaseConfig } from './helpers/test-database';

describe('UserController (E2E)', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(createTestDatabaseConfig()), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users (Create User)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('John Doe');
          expect(res.body.email).toBe('john@example.com');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          expect(res.body).not.toHaveProperty('password');

          createdUserId = res.body.id;
        });
    });

    it('should convert email to lowercase', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Jane Doe',
          email: 'JANE@EXAMPLE.COM',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('jane@example.com');
        });
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for name shorter than 3 characters', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'AB',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for name longer than 100 characters', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'A'.repeat(101),
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for password shorter than 6 characters', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 400 for duplicate email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Duplicate User',
          email: 'john@example.com', // Already created
          password: 'password123',
        })
        .expect(400);
    });

    it('should not return password in response', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Security Test',
          email: 'security@example.com',
          password: 'secretPassword',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password');
          expect(res.body.password).toBeUndefined();
        });
    });
  });

  describe('GET /users/:id (Get User)', () => {
    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body.name).toBe('John Doe');
          expect(res.body.email).toBe('john@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });

    it('should not return password in response', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password');
        });
    });
  });

  describe('GET /users (List Users)', () => {
    it('should list users with default pagination', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('users');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(res.body).toHaveProperty('totalPages');
          expect(Array.isArray(res.body.users)).toBe(true);
          expect(res.body.users.length).toBeGreaterThan(0);
        });
    });

    it('should list users with custom page and limit', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(2);
          expect(res.body.users.length).toBeLessThanOrEqual(2);
        });
    });

    it('should not return passwords in user list', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          res.body.users.forEach((user) => {
            expect(user).not.toHaveProperty('password');
          });
        });
    });

    it('should return correct pagination metadata', () => {
      return request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
          expect(res.body.total).toBeGreaterThanOrEqual(0);
          expect(res.body.totalPages).toBeGreaterThanOrEqual(0);
        });
    });

    it('should return empty array for page out of range', () => {
      return request(app.getHttpServer())
        .get('/users?page=1000&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.users).toHaveLength(0);
        });
    });
  });

  describe('PUT /users/:id (Update User)', () => {
    it('should update user name', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          name: 'John Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('John Updated');
          expect(res.body.id).toBe(createdUserId);
        });
    });

    it('should update user email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          email: 'john.updated@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('john.updated@example.com');
        });
    });

    it('should update user password', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          password: 'newPassword123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should update multiple fields at once', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          name: 'John Multi Update',
          email: 'john.multi@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('John Multi Update');
          expect(res.body.email).toBe('john.multi@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/550e8400-e29b-41d4-a716-446655440000')
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });

    it('should return 400 for invalid name', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          name: 'AB',
        })
        .expect(400);
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for password shorter than 6 characters', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          password: '12345',
        })
        .expect(400);
    });

    it('should return 400 for duplicate email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          email: 'jane@example.com', // Already exists
        })
        .expect(400);
    });

    it('should allow updating to same email', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          email: 'john.multi@example.com', // Same email
          name: 'Same Email Update',
        })
        .expect(200);
    });

    it('should convert email to lowercase on update', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({
          email: 'JOHN.LOWERCASE@EXAMPLE.COM',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('john.lowercase@example.com');
        });
    });

    it('should update updatedAt timestamp', async () => {
      const beforeUpdate = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      const beforeUpdatedAt = new Date(beforeUpdate.body.updatedAt);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const afterUpdate = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send({ name: 'Timestamp Test' })
        .expect(200);

      const afterUpdatedAt = new Date(afterUpdate.body.updatedAt);

      expect(afterUpdatedAt.getTime()).toBeGreaterThan(
        beforeUpdatedAt.getTime(),
      );
    });
  });

  describe('DELETE /users/:id (Delete User)', () => {
    let userToDelete: string;

    beforeEach(async () => {
      // Create a user to delete
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'User To Delete',
          email: `delete${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201);

      userToDelete = response.body.id;
    });

    it('should delete user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userToDelete}`)
        .expect(200);
    });

    it('should return 404 when getting deleted user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/users/${userToDelete}`)
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });

    it('should return 404 when deleting same user twice', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userToDelete}`)
        .expect(200);

      return request(app.getHttpServer())
        .delete(`/users/${userToDelete}`)
        .expect(404);
    });
  });

  describe('Complete User Lifecycle', () => {
    it('should create, read, update, and delete a user', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Lifecycle User',
          email: `lifecycle${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201);

      const userId = createResponse.body.id;
      expect(userId).toBeDefined();

      // Read
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Lifecycle User');
        });

      // Update
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({
          name: 'Lifecycle User Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Lifecycle User Updated');
        });

      // Read again to verify update
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Lifecycle User Updated');
        });

      // Delete
      await request(app.getHttpServer()).delete(`/users/${userId}`).expect(200);

      // Verify deletion
      await request(app.getHttpServer()).get(`/users/${userId}`).expect(404);
    });
  });
});
