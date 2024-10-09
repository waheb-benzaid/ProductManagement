import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.dto.ts';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    console.log('hi');
    return this.authService.login(loginDto);
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }
}
