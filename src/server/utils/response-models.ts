import { HttpStatus } from '@nestjs/common';
import { Paginated } from './pagination';

export interface ApiResponse<T = void> {
  message?: string;
  status: HttpStatus;
  data?: T;
}

export interface ApiErrorResponse<T = any> extends ApiResponse<T> {
  errors?: any;
  message?: string;
  status: HttpStatus;
  timestamp?: string;
  path?: string;
}

export interface PaginatedList<T = void> extends Paginated {
  data: T[];
}

export interface PaginatedApiResponse<T = void>
  extends PaginatedList<T>,
    ApiResponse<T[]> {
  data: T[];
}
