import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDefined, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { PaginationRequest } from './pagination';
import { IsStringObjectId, ObjectIdTransform } from './validators';

export class ParamsIdRequest {
  @ApiProperty({ type: 'string' })
  @Transform(ObjectIdTransform)
  @IsDefined()
  @IsStringObjectId()
  id: Types.ObjectId;
}

// tslint:disable-next-line: max-classes-per-file
export class SearchRequestViewModel {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;
}

// tslint:disable-next-line: max-classes-per-file
export class SearchWithPaginationRequestViewModel extends PaginationRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;
}
