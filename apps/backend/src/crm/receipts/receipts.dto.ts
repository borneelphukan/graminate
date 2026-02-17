import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for individual line items within an invoice
export class ItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;
}

// DTO for creating a new receipt (invoice)
export class CreateReceiptDto {
  @IsInt()
  @Min(1)
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bill_to: string;

  @IsDateString()
  @IsNotEmpty()
  due_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  receipt_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bill_to_address_line1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bill_to_address_line2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  bill_to_postal_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shipping?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  payment_terms?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  linked_sale_id?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items?: ItemDto[];
}

// DTO for updating an existing receipt (invoice)
export class UpdateReceiptDto {
  @IsInt()
  @Min(1)
  invoice_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bill_to: string;

  @IsDateString()
  @IsNotEmpty()
  due_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  receipt_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bill_to_address_line1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bill_to_address_line2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  bill_to_postal_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bill_to_country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shipping?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  payment_terms?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  linked_sale_id?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items?: ItemDto[];
}
