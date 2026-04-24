import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('用户不存在');

    let isMatch = false;

    // 兼容逻辑
    if (user.password.startsWith('$2')) {
      // bcrypt 加密密码
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // 旧明文密码
      isMatch = user.password === password;
    }

    if (!isMatch) throw new UnauthorizedException('密码错误');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { id: user.id, email: user.email, role: user.role, token };
  }
}