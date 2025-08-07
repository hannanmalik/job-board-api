import { Entity,PrimaryGeneratedColumn,Column, ManyToOne } from "typeorm";
import { Role } from "../../roles/entities/role.entity";
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

}