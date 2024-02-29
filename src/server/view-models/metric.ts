import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
} from 'class-validator';
import { Types } from 'mongoose';
import { MetricType } from '../entities';
import { IsStringObjectId, ObjectIdTransform } from '../utils/validators';

export class MetricDto {
  @ApiProperty({ type: String })
  @IsDefined()
  @IsStringObjectId()
  @Transform(ObjectIdTransform)
  applicationId: Types.ObjectId;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  service: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  metricUrl: string;

  @ApiProperty({ enum: MetricType })
  @IsDefined()
  @IsString()
  @IsEnum(MetricType)
  metricType: MetricType;

  @ValidateIf((obj) => obj.metricType === MetricType.HealthApi)
  @ApiProperty({ required: false })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  responseField?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((obj) => obj.metricType === MetricType.HealthApi)
  @ApiProperty({ required: false })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  healthyValue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  healthyDelay?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  nonFatal?: boolean;
}
