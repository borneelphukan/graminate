import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsPositive,
  MaxLength,
  IsEnum,
  Min,
} from 'class-validator';

export enum MarketplaceCategory {
  POULTRY = 'Poultry',
  APICULTURE = 'Apiculture',
  CATTLE_REARING = 'Cattle Rearing',
  FLORICULTURE = 'Floriculture',
}

export class CreateMarketplaceProductDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsOptional()
  @IsInt()
  inventory_id?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  units: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateMarketplaceProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  units?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class PublishProductDto {
  @IsNotEmpty()
  @IsInt()
  product_id: number;
}

export class ToggleFavoriteDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  product_id: number;
}

export class ToggleWishlistDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  product_id: number;
}

export class AddToCartDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsInt()
  product_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class UpdateCartQuantityDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

export class SaveBankDetailsDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  cardholder_name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  card_number: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  expiry_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  card_type?: string;
}

export class CreateCheckoutDto {
  @IsNotEmpty()
  @IsInt()
  user_id: number;
}

export class VerifyPaymentDto {
  @IsNotEmpty()
  @IsString()
  razorpay_order_id: string;

  @IsNotEmpty()
  @IsString()
  razorpay_payment_id: string;

  @IsNotEmpty()
  @IsString()
  razorpay_signature: string;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string;
}
