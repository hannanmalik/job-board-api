import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  Body,
  Post,
  Controller,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import express from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
        private readonly config: ConfigService,
    
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken } = await this.authService.login(loginDto);
    console.log('this is token :    ' + accessToken);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: ms(this.config.get<number>('JWT_EXPIRES_IN'))
    });
    return { message: 'Login Successful' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    // `JwtAuthGuard` has already validated token and attached user
    // This avoids re-verifying token manually
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role?.name,
      name:req.user.name // since you joined role relation in guard
    };
  }
  // in AuthController
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'Logged out' };
  }
}
