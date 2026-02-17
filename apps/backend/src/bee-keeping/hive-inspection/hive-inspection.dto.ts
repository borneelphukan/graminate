import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateInspectionDto {
  @IsNumber()
  @IsNotEmpty()
  hive_id: number;

  @IsDateString()
  @IsNotEmpty()
  inspection_date: string;

  @IsOptional() @IsString() queen_status?: string;
  @IsOptional() @IsDateString() queen_introduced_date?: string;
  @IsOptional() @IsString() brood_pattern?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional() @IsString() population_strength?: string;
  @IsOptional() @IsNumber() frames_of_brood?: number;
  @IsOptional() @IsNumber() frames_of_nectar_honey?: number;
  @IsOptional() @IsNumber() frames_of_pollen?: number;
  @IsOptional() @IsString() room_to_lay?: string;
  @IsOptional() @IsString() queen_cells_observed?: string; // 'Yes' or 'No'
  @IsOptional() @IsNumber() queen_cells_count?: number;
  @IsOptional() @IsString() varroa_mite_method?: string;
  @IsOptional() @IsNumber() varroa_mite_count?: number;
  @IsOptional() @IsString() actions_taken?: string;
}

export class UpdateInspectionDto {
  @IsOptional() @IsDateString() @IsNotEmpty() inspection_date?: string;
  @IsOptional() @IsString() queen_status?: string;
  @IsOptional() @IsDateString() queen_introduced_date?: string;
  @IsOptional() @IsString() brood_pattern?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional() @IsString() population_strength?: string;
  @IsOptional() @IsNumber() frames_of_brood?: number;
  @IsOptional() @IsNumber() frames_of_nectar_honey?: number;
  @IsOptional() @IsNumber() frames_of_pollen?: number;
  @IsOptional() @IsString() room_to_lay?: string;
  @IsOptional() @IsString() queen_cells_observed?: string;
  @IsOptional() @IsNumber() queen_cells_count?: number;
  @IsOptional() @IsString() varroa_mite_method?: string;
  @IsOptional() @IsNumber() varroa_mite_count?: number;
  @IsOptional() @IsString() actions_taken?: string;
}

export class ResetInspectionsDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
