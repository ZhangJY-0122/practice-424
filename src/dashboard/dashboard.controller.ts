import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { FilterRequestDTO } from '../dto/filter-request.dto';


// 表盘控制器 - 提供数据可视化所需的统计接口
// 统计卡片、饼图、折线图、维度分组聚合接口
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  // 获取概览卡片数据（公司总数、总营收等）
  @Get('cards')
  cards() {
    return this.dashboardService.getCards();
  }

  // 获取公司等级分布的饼图数据
  @Get('level-pie')
  levelPie() {
    return this.dashboardService.getLevelPie();
  }

  // 获取按成立年份累计的公司数量折线图数据 
  @Get('year-line')
  yearLine() {
    return this.dashboardService.getYearLine();
  }

  // 根据筛选条件和维度进行分组聚合
  @Get('dimension-group')
  dimensionGroup(@Query() filter: FilterRequestDTO) {
    return this.dashboardService.getDimensionGroup(filter);
  }
}