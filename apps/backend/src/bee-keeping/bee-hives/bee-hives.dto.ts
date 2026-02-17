import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateHiveDto {
  @IsNumber()
  @IsNotEmpty()
  apiary_id: number;

  @IsString()
  @IsNotEmpty()
  hive_name: string;

  @IsOptional() @IsString() hive_type?: string;
  @IsOptional() @IsString() bee_species?: string;
  @IsOptional() @IsDateString() installation_date?: Date | string;
  // ## MODIFICATION START ##
  @IsOptional() @IsNumber() honey_capacity?: number;
  @IsOptional() @IsString() unit?: string;
  // ## MODIFICATION END ##
  @IsOptional() @IsString() ventilation_status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateHiveDto {
  @IsOptional() @IsString() @IsNotEmpty() hive_name?: string;
  @IsOptional() @IsString() hive_type?: string;
  @IsOptional() @IsString() bee_species?: string;
  @IsOptional() @IsDateString() installation_date?: Date | string;
  @IsOptional() @IsNumber() honey_capacity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() ventilation_status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class ResetHivesDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
