import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE', 'user_db'),// 替换为数据库名称
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true, ttl: 300 }),
    AuthModule,
    UserModule,
    CompanyModule,
    DashboardModule,
  ],
})
export class AppModule { }
