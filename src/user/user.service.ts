import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  // 根据邮箱查询用户（给登录用）
  async findByEmail(email: string) {
    if (!email) throw new Error('邮箱不能为空');
    return this.userRepo.findOneBy({ email });
  }

  // 根据ID查询用户
  async findById(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  /*
     获取用户列表（有权限控制 + 缓存）
     只有 admin / manager 可以查看
  */
  async list(currentUser: User) {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      throw new ForbiddenException('无权限');
    }

    const key = 'userList:all';
    const data = await this.cacheManager.get<User[]>(key);
    if (data) return data;

    const list = await this.userRepo.find();
    await this.cacheManager.set(key, list, 300); // 缓存5分钟
    return list;
  }

  async getUserById(id: number) {
    const key = `user:${id}`;
    const data = await this.cacheManager.get<User>(key);

    // 缓存有就直接返回
    if (data) {
      return {
        code: 200,
        message: '查询成功',
        data: data
      };
    }

    // 查询数据库
    const user = await this.userRepo.findOneBy({ id });

    //查不到用户直接抛异常，前端不会显示空
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 存入缓存
    await this.cacheManager.set(key, user, 300);

    return {
      code: 200,
      message: '查询成功',
      data: user
    };
  }

  // 新增用户（权限控制 + 密码加密 + 邮箱去重）
  async add(user: Partial<User>, currentUser: User) {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      throw new ForbiddenException('无权限');
    }
    if (currentUser.role === 'manager' && user.role !== 'user') {
      throw new ForbiddenException('manager 只能添加普通用户');
    }
    if (!user.email) throw new Error('邮箱不能为空');

    const exists = await this.findByEmail(user.email);
    if (exists) throw new ForbiddenException('邮箱已存在');

    // 密码加密
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    const newUser = this.userRepo.create(user);
    await this.userRepo.save(newUser);

    const result = await this.findById(newUser.id);
    return {
      code: 200,
      message: '添加用户成功',
      data: result
    };
  }

  //  删除用户（权限控制：不能删自己、不能删高级角色）
  async delete(id: number, currentUser: User) {
    if (id === currentUser.id) throw new ForbiddenException('不能删除自己');

    const target = await this.userRepo.findOneBy({ id });
    if (!target) throw new NotFoundException('用户不存在');

    // manager 不能删除 admin/manager
    if (currentUser.role === 'manager') {
      if (target.role === 'admin' || target.role === 'manager') {
        throw new ForbiddenException('无权限');
      }
    }

    await this.userRepo.delete(id);
    return {
      code: 200,
      message: '删除成功',
      data: null
    };
  }

  /*
   修改用户信息（支持修改邮箱 + 密码）
   权限：
    - admin 可以改所有人
    - manager 只能改普通用户
    - 不能改自己的角色
  */
  async update(id: number, updateData: { email?: string; password?: string }, currentUser: User) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('用户不存在');

    // 2. 权限校验
    if (currentUser.role === 'manager') {
      if (user.role !== 'user') {
        throw new ForbiddenException('无权限修改此用户');
      }
    }

    // 3. 如果修改邮箱，判断邮箱是否已被占用
    if (updateData.email && updateData.email !== user.email) {
      const exists = await this.findByEmail(updateData.email);
      if (exists) throw new ForbiddenException('邮箱已被使用');
    }

    // 4. 如果修改密码，加密密码
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await this.userRepo.update(id, updateData);

    //返回更新后的用户信息
    const updatedUser = await this.findById(id);
    return {
      code: 200,
      message: '修改成功',
      data: updatedUser,
    };
  }
}