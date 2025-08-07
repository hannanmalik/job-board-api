import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository:Repository<User>
    ){}

    async createUser(data:Partial<User>):Promise<User>{
        const user = this.userRepository.create(data);
        return await this.userRepository.save(user);
    }

    async findByEmail(email:string): Promise<User | null>{
        return await this.userRepository.findOne({where:{email}});
    }

}
