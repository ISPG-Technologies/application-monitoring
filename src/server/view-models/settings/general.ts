import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GeneralSettingsDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  timezone: string;
}
