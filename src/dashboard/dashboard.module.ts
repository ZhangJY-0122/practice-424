import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../company/company.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CompanyModule } from '../company/company.module';

// 仪表盘模块 - 提供数据统计和可视化服务
@Module({
  imports: [TypeOrmModule.forFeature([Company]), CompanyModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }