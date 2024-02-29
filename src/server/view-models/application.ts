import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { Types } from 'mongoose';
import { IsStringObjectId, ObjectIdTransform } from '../utils/validators';

export class ApplicationIdQueryDto {
  @ApiProperty({ type: String, required: false })
  @IsDefined()
  @Transform(ObjectIdTransform)
  @IsStringObjectId()
  applicationId: Types.ObjectId;
}
