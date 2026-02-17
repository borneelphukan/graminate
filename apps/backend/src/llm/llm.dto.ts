import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MessageDto {
  @IsString()
  sender: 'user' | 'bot';

  @IsString()
  text: string;
}

export class LlmDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  history: MessageDto[];

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
