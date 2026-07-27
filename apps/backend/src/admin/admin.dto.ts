import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
