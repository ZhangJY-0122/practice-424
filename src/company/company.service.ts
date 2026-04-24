import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { User } from '../user/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  // 权限校验：只有 admin / manager 才能操作公司
  private async assertAdminOrManager(userId: number): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user || !['admin', 'manager'].includes(user.role)) {
      throw new ForbiddenException('无权限');
    }
  }

  // 查询所有公司（带缓存）
  async list() {
    const key = 'companyList:all';
    const data = await this.cacheManager.get<Company[]>(key);
    if (data) return data;
    const list = await this.companyRepo.find();
    await this.cacheManager.set(key, list, 300); // 存入缓存，300秒过期
    return list;
  }

  // 根据 company_code 查询单个公司
  async getByCode(company_code: string) {
    const key = `company:${company_code}`;
    const data = await this.cacheManager.get<Company>(key);
    if (data) return data;
    const company = await this.companyRepo.findOneBy({ company_code });
    if (company) await this.cacheManager.set(key, company, 300);
    return company;
  }

  async add(company: Company, currentUserId: number) {
    await this.assertAdminOrManager(currentUserId);
    await this.companyRepo.save(company);
    return {
      code: 200,
      message: '新增公司成功',
      data: company
    };
  }

  async update(company: Company, currentUserId: number) {
    await this.assertAdminOrManager(currentUserId);
    await this.companyRepo.save(company);
    return {
      code: 200,
      message: '修改公司成功',
      data: company
    };
  }

  async delete(company_code: string, currentUserId: number) {
    await this.assertAdminOrManager(currentUserId);
    await this.companyRepo.delete({ company_code });
    return {
      code: 200,
      message: '删除公司成功',
      data: company_code
    };
  }
}