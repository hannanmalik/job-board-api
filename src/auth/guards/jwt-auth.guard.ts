// src/auth/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();

    // 1. Try Authorization header
    let token: string | undefined;
    const authHeader = request.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 2. If no header token, try httpOnly cookie "accessToken"
    if (!token) {
      token = request.cookies?.accessToken;
    }

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Verify token (throws if invalid/expired)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      // payload should include user id (sub) and maybe email/role
      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Load user from DB (include role relation)
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request for controllers/other guards to use
      request.user = user;
      return true;
    } catch (err) {
      // Normalize errors to UnauthorizedException
      // jwt errors have .name like TokenExpiredError / JsonWebTokenError
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
