import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class EmailSettingsDto {
  @ValidateIf((obj) => obj.sendMail || obj.host)
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  host: string;

  @ValidateIf((obj) => obj.sendMail || obj.username)
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ValidateIf((obj) => obj.sendMail || obj.password)
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateIf((obj) => obj.sendMail || obj.port)
  @ApiProperty()
  @IsDefined()
  @IsNumber()
  @Min(0)
  port: number;

  @ValidateIf((obj) => obj.sendMail || obj.from)
  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  from: string;

  @ValidateIf((obj) => obj.sendMail)
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  ssl?: boolean;

  @Exclude()
  configured?: boolean;
}
