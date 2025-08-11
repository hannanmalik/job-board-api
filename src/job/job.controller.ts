import { Body, Controller, Post, UseGuards,Get,Query, Param, Req } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilterJobDto } from './dto/filter-job.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('job')
export class JobController {
    constructor(private readonly jobService:JobService){}

    @Roles('company')
    @Post()
    async create(@Body() createJobDto:CreateJobDto, @Req() req:any){
        return await this.jobService.create(createJobDto,req.user);
    }


    @Get()
    async findAll(@Query() filterDto:FilterJobDto): Promise<Job[]>{
        return this.jobService.findAll(filterDto);
    }


    @Get(':id')
    async findOne(@Param('id') id:string){
        return this.jobService.findOne(id);
    }

}
