import {Column,Entity,ManyToOne,PrimaryGeneratedColumn} from 'typeorm';
import { User } from '../../user/entities/user.entity';


@Entity()
export class Job{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    title:string;

    @Column({type:'text'})
    description:string;

    @Column()
    location:string

    @Column()
    salary:string;

    @Column({default:true})
    isActive:boolean;

    @ManyToOne(()=>User,(user)=>user.jobs,{eager:true,onDelete:'CASCADE'})
    createdBy:User

    @Column({type:'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    createdAt:Date;
}