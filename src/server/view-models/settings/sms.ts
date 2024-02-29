import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class SMSSettingsDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Exclude()
  configured?: boolean;
}
