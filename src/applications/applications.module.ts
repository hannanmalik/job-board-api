import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsService } from 'src/utility/utility.service';

@Module({
  imports:[TypeOrmModule.forFeature([Application,Job,User]),AuthModule],
  providers: [ApplicationsService,UtilsService],
  controllers: [ApplicationsController]
})
export class ApplicationsModule {}
