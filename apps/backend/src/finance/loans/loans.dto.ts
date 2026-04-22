import { IsString, IsNumber, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  @IsNotEmpty()
  loan_name: string;

  @IsString()
  @IsNotEmpty()
  lender: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  interest_rate: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateLoanDto {
  @IsString()
  @IsOptional()
  loan_name?: string;

  @IsString()
  @IsOptional()
  lender?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  interest_rate?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
