import { IsOptional, IsString, MinLength, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Cover letter must be at least 20 characters' })
  coverLetter?: string;

  @IsOptional()
  @IsUrl({}, { message: 'resumeUrl must be a valid URL' })
  resumeUrl?: string;
}
