import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmUserModel } from '../../src/modules/user/infrastructure/persistence/typeorm/typeorm-user.model';

/**
 * Creates an in-memory SQLite database configuration for testing
 */
export function createTestDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [TypeOrmUserModel],
    synchronize: true,
    dropSchema: true,
    logging: false,
  };
}

/**
 * Creates a MySQL test database configuration
 * Note: Requires a running MySQL instance
 */
export function createMySQLTestDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'nestjs',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_DATABASE_TEST || 'nestjs_clean_arch_test',
    entities: [TypeOrmUserModel],
    synchronize: true,
    dropSchema: true,
    logging: false,
  };
}
