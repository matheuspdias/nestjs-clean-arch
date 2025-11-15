import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'nestjs',
      password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_DATABASE || 'nestjs_clean_arch',
      entities: [__dirname + '/**/*.model{.ts,.js}'],
      synchronize: true, // Set to false in production
      logging: process.env.NODE_ENV !== 'production',
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
