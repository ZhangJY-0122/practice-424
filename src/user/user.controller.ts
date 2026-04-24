import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { UserService } from './user.service';
import { User } from './user.entity';

// 自定义请求类型：挂载登录后的用户信息到 req.user
interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

// 用户模块统一接口前缀 /user
@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  /*
    获取用户列表
    携带当前登录人，用于权限过滤
  */
  @Get('list')
  list(@Request() req: AuthenticatedRequest) {
    return this.userService.list(req.user);
  }

  //根据id查询单个用户
  @Get('get/:id')
  get(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  // 新增用户
  @Post('add')
  add(@Body() user: Partial<User>, @Request() req: AuthenticatedRequest) {
    return this.userService.add(user, req.user);
  }

  // 删除用户
  @Delete('delete/:id')
  deleteUser(@Param('id') id: number, @Request() req: AuthenticatedRequest) {
    return this.userService.delete(id, req.user);
  }


  // 修改用户信息
  @Post('update')
  updateUser(
    @Body() body: { id: number; email?: string; password?: string },
    @Request() req: AuthenticatedRequest
  ) {
    return this.userService.update(body.id, body, req.user);
  }
}
