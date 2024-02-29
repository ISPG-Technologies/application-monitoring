import { Injectable } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  Document,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';
import { Dict } from '../interfaces';
import {
  CrudAggregationOptions,
  CrudFindOneOptions,
  CrudListOptions,
} from './options';

@Injectable()
export class CrudService {
  async getList<T = any>(
    model: Model<T>,
    filters: FilterQuery<T>,
    options?: CrudListOptions,
  ) {
    let query = model.find({ ...filters });
    if (options?.sort) {
      query = query.sort(options?.sort);
    }
    if (options?.pagination) {
      if (options?.pagination.skip) {
        query = query.skip(options?.pagination.skip);
      }
      query = query.limit(options?.pagination.count);
    }
    options?.populate?.forEach((pop) => {
      query = query.populate(pop.path, pop.select);
    });
    return query.lean().exec();
  }

  async aggregate<U = any, T = any>(
    model: Model<T>,
    pipeline: Dict[],
    options?: CrudAggregationOptions,
  ): Promise<U[]> {
    let query = model.aggregate(pipeline);
    if (options?.allowDiskUse) {
      query = query.allowDiskUse(true);
    }
    return query.exec();
  }

  async getCount<T = any>(
    model: Model<T>,
    filters?: FilterQuery<T>,
  ): Promise<number> {
    return model.countDocuments({ ...filters });
  }

  async findById<T = any>(
    model: Model<T>,
    _id: Types.ObjectId,
    options?: CrudFindOneOptions,
  ): Promise<T & Document> {
    let query = model.findById(_id);
    if (options?.select) {
      query = query.select(options.select);
    }
    if (options?.sort) {
      query = query.sort(options?.sort);
    }
    options?.populate?.forEach((pop) => {
      query = query.populate(pop.path, pop.select);
    });
    const result = (await query.lean().exec()) as T & Document;
    return result;
  }

  async findOne<T = any>(
    model: Model<T>,
    filters: FilterQuery<T>,
    options?: CrudFindOneOptions,
  ): Promise<T & Document> {
    let query = model.findOne(filters);
    if (options?.select) {
      query = query.select(options.select);
    }
    if (options?.sort) {
      query = query.sort(options?.sort);
    }
    options?.populate?.forEach((pop) => {
      query = query.populate(pop.path, pop.select);
    });
    const result = (await query.lean().exec()) as T & Document;
    return result;
  }

  async updateOne<T = any>(
    model: Model<T>,
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    return model.updateOne(filters, update, options);
  }

  async updateMany<T = any>(
    model: Model<T>,
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ) {
    return model.updateMany(filters, update, options);
  }

  async create<T = any>(model: Model<T>, item: T): Promise<T & Document> {
    return (await model.create(item)) as T & Document;
  }

  async bulkCreate<T = any>(
    model: Model<T>,
    items: T[],
  ): Promise<(T & Document)[]> {
    return (await model.insertMany(items)) as (T & Document)[];
  }

  async deleteOne<T = any>(model: Model<T>, filters: FilterQuery<T>) {
    return model.deleteOne(filters);
  }

  async deleteMany<T = any>(model: Model<T>, filters: FilterQuery<T>) {
    return model.deleteMany(filters);
  }

  async bulkWrite<T = any>(model: Model<T>, bulkWrite: any[]) {
    return model.bulkWrite(bulkWrite);
  }
}
