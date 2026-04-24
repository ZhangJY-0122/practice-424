import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/company.entity';
import { FilterRequestDTO } from '../dto/filter-request.dto';

// 统计卡片、饼图、折线图、维度分组聚合
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) { }

  // 公司总数、总营收、国家数、员工总数
  async getCards() {
    const companyCount = await this.companyRepo.count();
    const totalRevenue = await this.companyRepo.sum('annual_revenue');
    const employeeCount = await this.companyRepo.sum('employees');

    // 统计
    const countryCountRaw = await this.companyRepo
      .createQueryBuilder('c')
      .select('COUNT(DISTINCT c.country)', 'count')
      .getRawOne<{ count: string }>();

    const countryCount = countryCountRaw ? Number(countryCountRaw.count) : 0;

    return {
      companyCount,
      totalRevenue: totalRevenue ?? 0,
      countryCount,
      employeeCount: employeeCount ?? 0,
    };
  }

  // 公司等级分布饼图数据  返回：每个等级的公司数量 + 占比(%)

  async getLevelPie() {
    const rawList = await this.companyRepo
      .createQueryBuilder('c')
      .select('c.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.level')
      .getRawMany<{ level: number; count: string }>();

    const total = rawList.reduce((acc, item) => acc + Number(item.count), 0);

    return rawList.map(item => ({
      level: item.level,
      count: Number(item.count),
      percent: total ? (Number(item.count) / total) * 100 : 0,
    }));
  }

  // 按年份统计公司数量（折线图，累计递增）
  async getYearLine() {
    const rawList = await this.companyRepo
      .createQueryBuilder('c')
      .select('c.founded_year', 'year')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.founded_year')
      .orderBy('c.founded_year', 'ASC')
      .getRawMany<{ year: number; count: string }>();

    // 逐年累计
    let sum = 0;
    return rawList.map(item => {
      const count = Number(item.count);
      sum += count;
      return { year: item.year, total: sum };
    });
  }

  // 维度分组聚合 支持按 level / country / city 分组，并支持筛选
  async getDimensionGroup(filter: FilterRequestDTO) {
    const qb = this.companyRepo.createQueryBuilder('c');

    // 筛选条件
    if (filter.level) {
      const levelArr = String(filter.level).split(',').map(Number);
      qb.andWhere('c.level IN (:...levels)', { levels: levelArr });
    }
    if (filter.country) {
      qb.andWhere('c.country = :country', { country: filter.country });
    }
    if (filter.city) {
      qb.andWhere('c.city = :city', { city: filter.city });
    }
    if (filter.minEmployees) {
      qb.andWhere('c.employees >= :min', { min: filter.minEmployees });
    }
    if (filter.maxEmployees) {
      qb.andWhere('c.employees <= :max', { max: filter.maxEmployees });
    }

    const list = await qb.getMany();
    const dim = filter.dimension ?? 'level';
    const grouped: Record<string, any[]> = {};

    for (const item of list) {
      let key: string;
      switch (dim) {
        case 'level': key = `level${item.level}`; break;
        case 'country': key = item.country; break;
        case 'city': key = item.city; break;
        default: key = 'other';
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }

    return {
      dimension: dim,
      filter: filter,
      data: grouped,
    };
  }
}