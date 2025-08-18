import {
  BadRequestException,
  ForbiddenException,
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
import { UpdateJobDto } from './dto/update-job-dto';
import { UtilsService } from '../utility/utility.service';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utils: UtilsService,
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
      });

      const savedJob = await this.jobRepository.save(job);

      return this.utils.success('Job created Successfully', {
        title: savedJob.title,
        createdAt: savedJob.createdAt,
        userId: userObj.id,
      });
    } catch (error) {
      console.error('Error in create():', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Something went wrong while creating the job',
      );
    }
  }

  //FIND ALL
  async findAll(filterDto: FilterJobDto) {
    try {
      const { page = 1, limit = 10, title } = filterDto;
      this.utils.validatePagination(page, limit);
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
      const job = await this.jobRepository
        .createQueryBuilder('job')
        .leftJoin('job.createdBy', 'user')
        .addSelect(['user.id', 'user.email'])
        .where('job.id = :id', { id })
        .getOne();

      this.utils.ensureExists(job, 'Job');

      return job;
    } catch (error) {
      console.error(`Error in findOne(${id}):`, error);

      if (error instanceof NotFoundException) throw error; // Known error, rethrow
      throw new InternalServerErrorException(
        'Something went wrong while fetching the job',
      );
    }
  }

  //FIND JOBS FOR A SPECIFIC COMPANY (BY COMPANYID)

  async findByCompany(companyId: number, filterDto: FilterJobDto) {
    try {
      const { page = 1, limit = 10, title } = filterDto;
      this.utils.validatePagination(page, limit);
      const query = this.jobRepository
        .createQueryBuilder('job')
        .leftJoin('job.createdBy', 'user')
        // .addSelect(['user.id', 'user.email'])
        .where('user.id = :companyId', { companyId });

      if (title) {
        query.andWhere('job.title ILIKE :title', { title: `%${title}%` });
      }

      query.skip((page - 1) * limit).take(limit);

      const [jobs, total] = await query.getManyAndCount();
      return this.utils.success('Company Jobs Fetched Successfully', {
        jobs,
        meta: {
          total,
          page,
          limit,
          totalPage: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('JobService.findByCompany error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Could Not Fetch Company Jobs');
    }
  }

  // FIND jobs for current logged-in company
  async findMyJobs(userObj: User, filterDto: FilterJobDto) {
    try {
      if (!userObj || !userObj.id) {
        throw new BadRequestException('Invalid user');
      }

      return await this.findByCompany(userObj.id, filterDto);
    } catch (error) {
      console.error('JobService.findMyJobs error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Could not fetch your jobs');
    }
  }

  async update(jobId: string, dto: UpdateJobDto, companyUser: User) {
    try {
      // 1️⃣ First, ensure the job exists & belongs to the logged-in company user
      const job = await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['createdBy'],
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      this.utils.ensureOwnerShip(job.createdBy.id, companyUser.id);

      const result = await this.jobRepository.update(
        { id: jobId },
        { ...dto, ModifiedAt: new Date() },
      );

      if (result.affected && result.affected > 0) {
        // Fetch the updated job for returning
        const updatedJob = await this.jobRepository.findOne({
          where: { id: jobId },
        });

        return this.utils.success('Job updated successfully', updatedJob);
      } else {
        return this.utils.failure('No changes were made to the job');
      }
    } catch (err) {
      console.error('JobService.update error', err);

      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Could not update job');
    }
  }

  async remove(id: string, userObj: User) {
    try {
      const job = await this.jobRepository.findOne({
        where: { id },
        relations: ['createdBy'],
      });

      if (!job) {
        throw new NotFoundException(`Job with ID ${id} not found`);
      }

      this.utils.ensureOwnerShip(job.createdBy.id, userObj.id);
      await this.jobRepository.remove(job);
      return this.utils.success('Job deleted successfully', { id });
    } catch (error) {
      console.error(`JobService.remove(${id}) error:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      )
        throw error;
      throw new InternalServerErrorException('Could not delete job');
    }
  }
}
