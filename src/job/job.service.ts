import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { FilterJobDto } from './dto/filter-job.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // CREATE
  async create(createJobDto: CreateJobDto, userObj: User) {
    try {
      if (!userObj || !userObj.id) {
        throw new BadRequestException('Invalid user creating the job');
      }
      const job = this.jobRepository.create({
        ...createJobDto,
        createdBy: userObj,
        createdAt: new Date(),
      });

      const savedJob = await this.jobRepository.save(job);

      return {
        success: true,
        message: 'Job created successfully',
        data: { title: savedJob.title, createdAt: savedJob.createdAt },
      };
    } catch (error) {
      console.error('Error in create():', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating the job',
      );
    }
  }

  //FIND ALL
  async findAll(filterDto: FilterJobDto) {
    try {
      const { page = 1, limit = 10, title } = filterDto;
      const query = this.jobRepository.createQueryBuilder('job');
      if (title) {
        query.andWhere('job.title ILIKE :title', { title: `%${title}` });
      }
      query.skip((page - 1) * limit).take(limit);

      return query.getMany();
    } catch (error) {
      console.error('Error in findAll():', error);
      throw new InternalServerErrorException(
        'Something went wrong while fetching jobs',
      );
    }
  }

  //FIND ONE
  async findOne(id: string) {
    try {
      const job = await this.jobRepository.findOne({ where: { id } });

      if (!job) {
        throw new NotFoundException(`Job with ID ${id} not found`);
      }

      return job;
    } catch (error) {
      console.error(`Error in findOne(${id}):`, error);

      if (error instanceof NotFoundException) {
        throw error; // Known error, rethrow
      }

      throw new InternalServerErrorException(
        'Something went wrong while fetching the job',
      );
    }
  }
}
