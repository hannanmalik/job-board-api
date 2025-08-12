import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateApplicationDto } from './dto/create-appilcation.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly appService: ApplicationsService) {}

  @Roles('company')
  @Get('/job/:jobId')
  async listForJob(@Param('jobId') jobId: string, @Req() req: any) {
    return this.appService.findApplicationsForJob(jobId, req.user);
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
  async myApplications(@Req() req: any) {
    return this.appService.findMyApplications(req.user);
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
    const updated = await this.appService.updateStatus(id, dto, req.user);
    return { success: true, message: 'Application updated', data: updated };
  }
}
