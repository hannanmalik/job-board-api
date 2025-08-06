import { Injectable,OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor (private dataSource:DataSource){}

  async onModuleInit(){
    try{
      if(this.dataSource.isInitialized){
        console.log('Database connection established successfully');
      }else{
        await this.dataSource.initialize();
        console.log('Database connection  initialized manually');
      }
    }catch(error){
      console.error('Error connecting to the database',error);
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
