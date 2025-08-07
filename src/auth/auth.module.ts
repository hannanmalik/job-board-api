import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports:[UserModule,ConfigModule,TypeOrmModule.forFeature([User, Role]),JwtModule.registerAsync({
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory:(config:ConfigService)=> ({
      secret:config.get<string>('JWT_SECRET'),
      signOptions:{
        expiresIn:config.get<string>('JWT_EXPIRES_IN'),
      }
    }),
  })],
  providers: [AuthService,JwtAuthGuard],
  exports: [AuthService,JwtModule,JwtAuthGuard,TypeOrmModule],

  controllers: [AuthController]
})


export class AuthModule {}
