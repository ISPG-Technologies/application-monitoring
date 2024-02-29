import { IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { IntTransform } from './validators';
import { Document, Query } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(IntTransform)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(IntTransform)
  @IsInt()
  @Min(1)
  perPage?: number;
}

export interface Pagination {
  skip?: number;
  count: number;
  perPage: number;
  page: number;
}

export interface Paginated {
  count: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const getPagination = (
  paginationReq: PaginationRequest,
  options?: { loadDefault?: boolean },
): Pagination | undefined => {
  if (
    !options?.loadDefault &&
    (!paginationReq || paginationReq.page === undefined)
  ) {
    return undefined;
  }

  const { perPage = 30, page = 1 } = paginationReq || {};
  return {
    count: perPage,
    skip: (page - 1) * perPage,
    page,
    perPage,
  };
};

export const addPaginationToQuery = <T extends Document>(
  query: Query<T[], T>,
  pagination?: Pagination,
): Query<T[], T> => {
  let q = query;
  if (pagination) {
    if (pagination.skip) {
      q = q.skip(pagination.skip);
    }
    q = q.limit(pagination.count);
  }
  return q;
};

export const addPaginationToAggregationPipeline = (
  pipeline: any[],
  pagination?: Pagination,
) => {
  if (pagination) {
    if (pagination.skip) {
      pipeline.push({ $skip: pagination.skip });
    }
    pipeline.push({ $limit: pagination.count });
  }
};

export const getPaginatedCounts = (
  count: number,
  pagination?: Pagination,
): Paginated => {
  return {
    page: pagination?.page || 1,
    perPage: pagination?.perPage || count,
    totalPages:
      count === 0 ? 0 : Math.ceil(count / (pagination?.perPage || count)),
    count,
  };
};
