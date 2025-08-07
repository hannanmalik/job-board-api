import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Job } from './entities/job.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('job')
export class JobController {
    constructor(private readonly jobService:JobService){}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() createJobDto:CreateJobDto): Promise<Job>{
        return await this.jobService.create(createJobDto);
    }


}
