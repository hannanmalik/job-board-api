import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
    constructor(
        @InjectRepository(Job)
        private readonly jobRepository:Repository<Job>,
    ){}

    async create(createJobDto:CreateJobDto):Promise<Job>{
        const job = this.jobRepository.create(createJobDto);
        return await this.jobRepository.save(job);
    }
}
