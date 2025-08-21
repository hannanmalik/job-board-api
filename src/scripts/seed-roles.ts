// src/scripts/seed-roles.ts
//npm run seed:roles 
import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { Job } from '../job/entities/job.entity';
import { Application } from '../applications/entities/application.entity';
const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '8998',
  database: 'jobboard_db',
  entities: [User,Role,Job,Application],
  synchronize: true,
});

async function seedRoles() {
  await AppDataSource.initialize();
  const roleRepo = AppDataSource.getRepository(Role);

  const roles = ['admin', 'company', 'candidate'];

  for (const name of roles) {
    const existing = await roleRepo.findOne({ where: { name } });
    if (!existing) {
      const role = roleRepo.create({ name });
      await roleRepo.save(role);
      console.log(`Inserted role: ${name}`);
    } else {
      console.log(`Role already exists: ${name}`);
    }
  }

  await AppDataSource.destroy();
}

seedRoles();
