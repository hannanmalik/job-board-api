import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Role } from 'src/roles/entities/role.entity';
import { User } from 'src/user/entities/user.entity';


dotenv.config();

export const typeOrmConfig:TypeOrmModuleOptions={
    type:'postgres',
    host:process.env.DB_HOST,
    port:parseInt(process.env.DB_PORT || '5432',10),
    username: process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    autoLoadEntities:true,
    synchronize:true,
    logging:true,
    entities:[User,Role]
};