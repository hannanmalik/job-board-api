import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column()
  salary: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.jobs, {
    eager: false,
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @Column()
  createdAt: Date = new Date();

  @Column()
  ModifiedAt: Date = new Date();
  @OneToMany(() => Application, (app) => app.job)
  applications: Application[];
}
