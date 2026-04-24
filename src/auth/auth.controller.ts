import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

// 认证控制器：处理登录、注册、登出等权限相关接口
// 接口前缀：/auth
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // 用户登录接口 - POST /auth/login
  // 接收 email 和 password，返回用户信息和 JWT token
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}