import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateApplicationDto } from './dto/create-appilcation.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { FilterJobDto } from 'src/job/dto/filter-job.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  @Roles('company')
  @Get('/job/:jobId')
  async listForJob(@Param('jobId') jobId: string,@Query() filterDto: FilterJobDto, @Req() req: any) {
      const { page = 1, limit = 10 } = filterDto;
  return this.appService.findApplicationsForJob(jobId, req.user, page, limit);
  }

  @Roles('candidate')
  @Post('/apply/:jobId')
  async apply(
    @Param('jobId') jobId: string,
    @Body() dto: CreateApplicationDto,
    @Req() req: any,
  ) {
    const saved = await this.appService.apply(jobId, dto, req.user);
    return { success: true, message: 'Applied Successfully', data: saved };
  }

  // Candidate's applications
  @Roles('candidate')
  @Get('my')
  async myApplications(@Req() req: any,@Query() filterDto: FilterJobDto) {
          const { page = 1, limit = 10 } = filterDto;
    return this.appService.findMyApplications(req.user,page, limit);
  }

  // Candidate withdraws
  @Roles('candidate')
  @Delete(':id')
  async withdraw(@Param('id') id: string, @Req() req: any) {
    return this.appService.withdraw(id, req.user);
  }

  // Company updates status
  @Roles('company')
  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: any,
  ) {
    return await this.appService.updateStatus(id, dto, req.user);

  }
}
