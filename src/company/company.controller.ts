import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { User } from '../user/user.entity';

// 扩展请求类型：让 req.user 拥有用户类型
interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

// 企业模块接口前缀 /company
@Controller('company')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Get('list')
  list() {
    return this.companyService.list();
  }

  @Get('get/:code')
  get(@Param('code') code: string) {
    return this.companyService.getByCode(code);
  }

  @Post('add')
  add(@Body() company: Partial<Company>, @Request() req: AuthenticatedRequest) {
    return this.companyService.add(company as Company, req.user.id);
  }

  @Post('update')
  update(@Body() company: Company, @Request() req: AuthenticatedRequest) {
    return this.companyService.update(company, req.user.id);
  }

  @Delete('delete/:code')
  delete(@Param('code') code: string, @Request() req: AuthenticatedRequest) {
    return this.companyService.delete(code, req.user.id);
  }
}
