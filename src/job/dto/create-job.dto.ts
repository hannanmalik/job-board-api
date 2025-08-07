import { IsNotEmpty,IsString,IsNumber } from "class-validator";

export class CreateJobDto{
    @IsString()
    @IsNotEmpty()
    title:string;

    @IsString()
    @IsNotEmpty()
    description:string;

    @IsString()
    @IsNotEmpty()
    location:string;

    @IsString()
    @IsNotEmpty()
    salary:string
}