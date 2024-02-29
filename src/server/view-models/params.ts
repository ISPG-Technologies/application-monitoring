import { IsDefined, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { ObjectIdTransform } from '../utils';
import { ApiProperty } from '@nestjs/swagger';

export class ParamsIdRequest {
  @ApiProperty({ type: String })
  @IsDefined()
  @IsNotEmpty()
  @Transform(ObjectIdTransform)
  id: Types.ObjectId;
}
