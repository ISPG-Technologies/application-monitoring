import {
  FilterQuery,
  Model,
  QueryOptions,
  Types,
  UpdateQuery,
  Document,
} from 'mongoose';
import {
  CrudAggregationOptions,
  CrudFindOneOptions,
  CrudListOptions,
  // ModelCacheOptions,
} from './options';
import { CrudService } from './crud.service';
import { Dict } from '../interfaces';

export class CrudModelService<T> {
  private crudService: CrudService;
  constructor(
    private model: Model<T>, // private cacheOptions?: ModelCacheOptions,
  ) {
    this.crudService = new CrudService();
  }

  async getList(filters: FilterQuery<T>, options?: CrudListOptions) {
    return this.crudService.getList(this.model, filters, options);
  }

  async aggregate<U = any>(
    pipeline: Dict[],
    options?: CrudAggregationOptions,
  ): Promise<U[]> {
    return this.crudService.aggregate(this.model, pipeline, options);
  }

  async getCount(filters?: FilterQuery<T>): Promise<number> {
    return this.crudService.getCount(this.model, filters);
  }

  async findById(
    _id: Types.ObjectId,
    options?: CrudFindOneOptions,
  ): Promise<T & Document> {
    return this.crudService.findById(this.model, _id, options);
  }

  async findOne(
    filters: FilterQuery<T>,
    options?: CrudFindOneOptions,
  ): Promise<T & Document> {
    return this.crudService.findOne(this.model, filters, options);
  }

  async updateOne(
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    return this.crudService.updateOne(this.model, filters, update, options);
  }

  async updateMany(
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    return this.crudService.updateMany(this.model, filters, update, options);
  }

  async create(item: T): Promise<T & Document> {
    return this.crudService.create(this.model, item);
  }

  async bulkCreate(items: T[]): Promise<(T & Document)[]> {
    return this.crudService.bulkCreate(this.model, items);
  }

  async deleteOne(filters: FilterQuery<T>) {
    return this.crudService.deleteOne(this.model, filters);
  }

  async deleteMany(filters: FilterQuery<T>) {
    return this.crudService.deleteMany(this.model, filters);
  }

  async bulkWrite(bulkWrite: any[]) {
    return this.crudService.bulkWrite(this.model, bulkWrite);
  }
}
