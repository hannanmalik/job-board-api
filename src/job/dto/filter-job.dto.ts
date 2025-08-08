import { IsOptional,IsPositive,IsString } from "class-validator";
import { Type } from "class-transformer";

export class FilterJobDto{
    @IsOptional()
    @Type(()=>Number)
    @IsPositive()
    page?:number=1;

    @IsOptional()
    @Type(()=>Number)
    @IsPositive()
    limit?:number=10;

    @IsOptional()
    @IsString()
    title?:string;
    
    
}