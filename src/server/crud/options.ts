import { Dict } from '../interfaces';
import { Pagination } from '../utils/pagination';

export interface CrudFindOneOptions {
  sort?: Dict<1 | -1>;
  select?: any;
  populate?: { path: string; select?: any }[];
}

export interface CrudListOptions extends CrudFindOneOptions {
  pagination?: Pagination;
}

export interface CrudAggregationOptions {
  allowDiskUse?: boolean;
}

export interface ModelCacheOptions {
  cacheBaseKey: string;
}
