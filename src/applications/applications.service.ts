import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';
import { Repository } from 'typeorm';
import { Job } from 'src/job/entities/job.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateApplicationDto } from './dto/create-appilcation.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly appRepository: Repository<Application>,

    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async apply(jobId: string, dto: CreateApplicationDto, candidate: User) {
    try {
      const job = await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['createdBy'],
      });

      if (!job?.isActive) throw new NotFoundException('Job not Found!');

      if (job.createdBy && job.createdBy.id === candidate.id) {
        throw new ForbiddenException('You cannot apply to your own job.');
      }

      const existing = await this.appRepository.findOne({
        where: { job: { id: jobId }, candidate: { id: candidate.id } },
      });
      if (existing)
        throw new BadRequestException('You have already applied to this job.');

      const appilcation = this.appRepository.create({
        job,
        candidate,
        coverLetter: dto.coverLetter,
        resumeUrl: dto.resumeUrl,
        status: ApplicationStatus.PENDING,
      });

      await this.appRepository.save(appilcation);
      return {
        ...appilcation,
        candidate: undefined,
      };
    } catch (error) {
      console.error('ApplicationService.apply error', error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Could not apply to job');
    }
  }

  // Candidate lists their applications
  async findMyApplications(
    user: User,
    page = 1,
    limit = 10,
    status?: ApplicationStatus,
  ) {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'page and limit must be positive integers',
        );
      }

      const query = this.appRepository
        .createQueryBuilder('application')
        .leftJoin('application.job', 'job')
        .leftJoin('job.createdBy', 'company')
        .select([
          'application.id',
          'application.coverLetter',
          'application.resumeUrl',
          'application.status',
          'application.createdAt',
          'application.updatedAt',

          'job.id',
          'job.title',
          'job.location',
          'job.salary',
          'job.isActive',

          'company.id',
          'company.email',
        ])
        .where('application.candidateId = :candidateId', {
          candidateId: user.id,
        })
        .orderBy('application.createdAt', 'DESC');

      if (status) {
        query.andWhere('application.status = :status', { status });
      }

      query.skip((page - 1) * limit).take(limit);

      const [applications, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Your applications fetched successfully',
        data: applications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error('ApplicationService.findMyApplications error', err);
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(
        'Could not fetch your applications',
      );
    }
  }

  // Candidate withdraws an application
  async withdraw(applicationId: string, user: User) {
    try {
      const app = await this.appRepository.findOne({
        where: { id: applicationId },
        relations: ['candidate'],
      });
      if (!app) throw new NotFoundException('Application not found');

      if (app.candidate.id !== user.id) {
        throw new ForbiddenException(
          'You are not the owner of this application',
        );
      }

      await this.appRepository.update(
        { id: applicationId },
        { status: ApplicationStatus.WITHDRAWN },
      );
      return {
        success: true,
        message: 'Application withdrawn',
        data: { id: applicationId, status: ApplicationStatus.WITHDRAWN },
      };
    } catch (err) {
      console.error('ApplicationService.withdraw error', err);
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException('Could not withdraw application');
    }
  }

  // Company lists applications for a specific job they own
  async findApplicationsForJob(
    jobId: string,
    companyUser: User,
    page = 1,
    limit = 10,
    status?: ApplicationStatus,
  ) {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'page and limit must be positive integers',
        );
      }

      const job = await this.jobRepository.findOne({
        where: { id: jobId },
        relations: ['createdBy'],
      });
      if (!job) throw new NotFoundException('Job not found');

      if (!job.createdBy || job.createdBy.id !== companyUser.id) {
        throw new ForbiddenException('You do not own this job');
      }

      const query = this.appRepository
        .createQueryBuilder('application')
        .leftJoin('application.candidate', 'candidate')
        .where('application.jobId = :jobId', { jobId })
        .orderBy('application.createdAt', 'DESC')
        .select(['application', 'candidate.id', 'candidate.email']);

      if (status) {
        query.andWhere('application.status = :status', { status });
      }

      query.skip((page - 1) * limit).take(limit);

      const [applications, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Applications fetched successfully',
        data: applications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error('ApplicationService.findApplicationsForJob error', err);
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException('Could not fetch applications');
    }
  }

  // Company updates status (accept/reject) of an application
  async updateStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
    companyUser: User,
  ) {
    try {
      const app = await this.appRepository.findOne({
        where: { id: applicationId },
        relations: ['job', 'job.createdBy'],
      });

      if (!app) throw new NotFoundException('Application not found');

      // ensure company owns the job
      if (!app.job.createdBy || app.job.createdBy.id !== companyUser.id) {
        throw new ForbiddenException('You are not the owner of this job');
      }

      // set status
      app.status = dto.status;
      const updated = await this.appRepository.save(app);

      return updated;
    } catch (err) {
      console.error('ApplicationService.updateStatus error', err);
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException(
        'Could not update application status',
      );
    }
  }
}
