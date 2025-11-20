/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestDatabaseConfig } from './helpers/test-database';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

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

  describe('POST /auth/register (Register User)', () => {
    it('should register a new user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Auth Test User',
          email: `auth-test-${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body).toHaveProperty('tokenType');
          expect(res.body.tokenType).toBe('Bearer');
          expect(res.body.expiresIn).toBe(3600);

          // Tokens should be JWT format (header.payload.signature)
          expect(res.body.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
          expect(res.body.refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
        });
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for duplicate email', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'First User',
          email,
          password: 'password123',
        })
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Second User',
          email,
          password: 'password456',
        })
        .expect(400);
    });

    it('should convert email to lowercase', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Lowercase Test',
          email: `UPPERCASE-${Date.now()}@EXAMPLE.COM`,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 400 for short name', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'AB',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login (Login User)', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
      // Create a user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Login Test User',
          email: testEmail,
          password: testPassword,
        })
        .expect(201);
    });

    it('should login with valid credentials and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body).toHaveProperty('tokenType');
          expect(res.body.tokenType).toBe('Bearer');
          expect(res.body.expiresIn).toBe(3600);

          // Save tokens for refresh token tests
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 400 for missing email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
        })
        .expect(400);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should accept email in any case', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail.toUpperCase(),
          password: testPassword,
        })
        .expect(200);
    });
  });

  describe('POST /auth/refresh (Refresh Token)', () => {
    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body).toHaveProperty('tokenType');
          expect(res.body.tokenType).toBe('Bearer');
          expect(res.body.expiresIn).toBe(3600);

          // New access token should be different from the old one
          expect(res.body.accessToken).not.toBe(accessToken);

          // Should be valid JWT format
          expect(res.body.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
        });
    });

    it('should return 401 for invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid.token.here',
        })
        .expect(401);
    });

    it('should return 401 for expired refresh token', () => {
      // Using a token that is properly formatted but expired/invalid
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjB9.invalid';

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: expiredToken,
        })
        .expect(401);
    });

    it('should return 400 for missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });

    it('should return 401 for malformed refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'not-a-valid-jwt',
        })
        .expect(401);
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should complete full auth flow: register -> login -> refresh', async () => {
      const email = `flow-test-${Date.now()}@example.com`;
      const password = 'password123';

      // Step 1: Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Flow Test User',
          email,
          password,
        })
        .expect(201);

      expect(registerResponse.body.accessToken).toBeDefined();
      const registerAccessToken = registerResponse.body.accessToken;

      // Step 2: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(200);

      expect(loginResponse.body.accessToken).toBeDefined();
      expect(loginResponse.body.refreshToken).toBeDefined();

      // Access tokens from register and login should be different
      expect(loginResponse.body.accessToken).not.toBe(registerAccessToken);

      // Step 3: Refresh
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: loginResponse.body.refreshToken,
        })
        .expect(200);

      expect(refreshResponse.body.accessToken).toBeDefined();
      // New access token should be different
      expect(refreshResponse.body.accessToken).not.toBe(loginResponse.body.accessToken);
    });
  });

  describe('Token Validation', () => {
    it('should accept valid JWT tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);
    });

    it('should reject tokens with invalid signature', () => {
      const invalidToken = accessToken.slice(0, -10) + 'invalidxxx';

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: invalidToken,
        })
        .expect(401);
    });
  });
});
