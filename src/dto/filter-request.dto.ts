import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRequestDTO {
  @IsOptional()
  @IsString()
  dimension?: string;

  @IsOptional()
  @Type(() => Number)
  level?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  minEmployees?: number;

  @IsOptional()
  @Type(() => Number)
  maxEmployees?: number;
}