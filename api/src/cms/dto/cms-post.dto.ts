import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PostStatus } from '../entities/cms-post.entity';

export class CreateCmsPostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

export class UpdateCmsPostDto extends PartialType(CreateCmsPostDto) {}
