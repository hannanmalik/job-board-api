import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Param,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilterJobDto } from './dto/filter-job.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateJobDto } from './dto/update-job-dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Post()
  async create(@Body() createJobDto: CreateJobDto, @Req() req: any) {
    return await this.jobService.create(createJobDto, req.user);
  }

  @Get()
  async findAll(@Query() filterDto: FilterJobDto){
    return this.jobService.findAll(filterDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Get('myjobs')
  async findMyJobs(@Req() req: any, @Query() filterDto: FilterJobDto) {
    return this.jobService.findMyJobs(req.user, filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('company/:companyId')
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query() filterDto: FilterJobDto,
  ) {
    return this.jobService.findByCompany(Number(companyId), filterDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Req() req: any,
  ) {
    return this.jobService.update(id, dto, req.user);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('company')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.jobService.remove(id, req.user);
  }
}
