import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
