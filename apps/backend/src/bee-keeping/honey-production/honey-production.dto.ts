import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateHoneyProductionDto {
  @IsNumber()
  @IsNotEmpty()
  hive_id: number;

  @IsDateString()
  @IsNotEmpty()
  harvest_date: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  honey_weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  frames_harvested?: number;

  @IsOptional()
  @IsString()
  honey_type?: string;

  @IsOptional()
  @IsString()
  harvest_notes?: string;
}

export class UpdateHoneyProductionDto {
  @IsOptional()
  @IsDateString()
  harvest_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  honey_weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  frames_harvested?: number;

  @IsOptional()
  @IsString()
  honey_type?: string;

  @IsOptional()
  @IsString()
  harvest_notes?: string;
}

export class ResetHoneyProductionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
