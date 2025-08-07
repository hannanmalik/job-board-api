import { Entity,PrimaryGeneratedColumn,Column, OneToMany,ManyToOne } from "typeorm";
import { Role } from "../../roles/entities/role.entity";
import { Job } from "../../job/entities/job.entity";
@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({unique:true})
    email:string

    @Column()
    password:string;

    @ManyToOne(()=>Role,(role)=>role.users)
    role:Role;

    @Column({default:true})
    isActive:boolean;

    @OneToMany(() => Job, (job) => job.createdBy)
    jobs: Job[];
}