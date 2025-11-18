import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { ListUsersRequest, ListUsersUseCase } from './list-users.usecase';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockUsers: User[];

  beforeEach(async () => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByEmail: jest.fn(),
    };

    useCase = new ListUsersUseCase(mockUserRepository);

    // Create mock users
    mockUsers = [
      User.create({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440001'),
        name: 'User One',
        email: Email.create('user1@example.com'),
        password: await Password.create('password123'),
      }),
      User.create({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440002'),
        name: 'User Two',
        email: Email.create('user2@example.com'),
        password: await Password.create('password123'),
      }),
      User.create({
        id: UserId.create('550e8400-e29b-41d4-a716-446655440003'),
        name: 'User Three',
        email: Email.create('user3@example.com'),
        password: await Password.create('password123'),
      }),
    ];
  });

  describe('execute', () => {
    it('should list users with default pagination', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      const result = await useCase.execute({});

      expect(result).toBeDefined();
      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should use default page 1 when not provided', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      await useCase.execute({});

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(1, 10);
    });

    it('should use default limit 10 when not provided', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      await useCase.execute({ page: 2 });

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(2, 10);
    });

    it('should list users with custom page', async () => {
      const request: ListUsersRequest = {
        page: 2,
        limit: 5,
      };

      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers.slice(0, 2),
        total: 10,
      });

      const result = await useCase.execute(request);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(2, 5);
    });

    it('should list users with custom limit', async () => {
      const request: ListUsersRequest = {
        page: 1,
        limit: 2,
      };

      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers.slice(0, 2),
        total: 3,
      });

      const result = await useCase.execute(request);

      expect(result.users).toHaveLength(2);
      expect(result.limit).toBe(2);
    });

    it('should calculate total pages correctly', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 25,
      });

      const result = await useCase.execute({ limit: 10 });

      expect(result.totalPages).toBe(3); // 25 / 10 = 3 pages
    });

    it('should handle exact page division', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 30,
      });

      const result = await useCase.execute({ limit: 10 });

      expect(result.totalPages).toBe(3); // 30 / 10 = 3 pages exactly
    });

    it('should return empty array when no users found', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await useCase.execute({});

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should not include passwords in response', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      const result = await useCase.execute({});

      result.users.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should include all required user fields in response', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: [mockUsers[0]],
        total: 1,
      });

      const result = await useCase.execute({});

      expect(result.users[0]).toHaveProperty('id');
      expect(result.users[0]).toHaveProperty('name');
      expect(result.users[0]).toHaveProperty('email');
      expect(result.users[0]).toHaveProperty('createdAt');
      expect(result.users[0]).toHaveProperty('updatedAt');
    });

    it('should map all users correctly', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 3,
      });

      const result = await useCase.execute({});

      expect(result.users[0].name).toBe('User One');
      expect(result.users[1].name).toBe('User Two');
      expect(result.users[2].name).toBe('User Three');
    });

    it('should handle large page numbers', async () => {
      const request: ListUsersRequest = {
        page: 100,
        limit: 10,
      };

      mockUserRepository.findAll.mockResolvedValue({
        users: [],
        total: 25,
      });

      const result = await useCase.execute(request);

      expect(result.page).toBe(100);
      expect(result.users).toHaveLength(0);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(100, 10);
    });

    it('should handle different limit values', async () => {
      const limits = [5, 20, 50, 100];

      for (const limit of limits) {
        mockUserRepository.findAll.mockResolvedValue({
          users: mockUsers,
          total: 100,
        });

        const result = await useCase.execute({ limit });

        expect(result.limit).toBe(limit);
        expect(result.totalPages).toBe(Math.ceil(100 / limit));
      }
    });

    it('should handle repository errors', async () => {
      mockUserRepository.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute({})).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should return correct pagination metadata', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 50,
      });

      const result = await useCase.execute({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
    });

    it('should calculate totalPages as 1 when total equals limit', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 10,
      });

      const result = await useCase.execute({ limit: 10 });

      expect(result.totalPages).toBe(1);
    });
  });
});
