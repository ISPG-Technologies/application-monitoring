import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { SearchWithPaginationRequestViewModel } from '../utils/request-models';
import {
  DateTransform,
  IsStringObjectId,
  ObjectIdTransform,
} from '../utils/validators';

export class GetMetricHistoryDto extends SearchWithPaginationRequestViewModel {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @Transform(ObjectIdTransform)
  @IsStringObjectId()
  metricId?: Types.ObjectId;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  application?: Types.ObjectId;

  @ApiProperty({ required: false })
  @Transform(DateTransform)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @Transform(DateTransform)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
