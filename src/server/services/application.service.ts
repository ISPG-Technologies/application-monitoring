import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';
import { CrudListOptions, CrudModelService } from '../crud';
import { Application } from '../entities';

@Injectable()
export class ApplicationService {
  private applicationModelService: CrudModelService<Application>;
  constructor(
    @InjectModel(Application.name)
    applicationModel: Model<Application>,
  ) {
    this.applicationModelService = new CrudModelService(applicationModel);
  }

  async getList(
    filters: FilterQuery<Application>,
    options?: CrudListOptions,
  ): Promise<Application[]> {
    return await this.applicationModelService.getList(filters, options);
  }

  async findById(id: Types.ObjectId) {
    return this.applicationModelService.findById(id);
  }

  async getCount(filters: FilterQuery<Application>): Promise<number> {
    return this.applicationModelService.getCount(filters);
  }

  public async create(metric: Application): Promise<Application> {
    return this.applicationModelService.create(metric);
  }

  public async updateById(
    id: Types.ObjectId,
    data: Partial<Application>,
  ): Promise<Application> {
    const metric = await this.applicationModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Application not found');
    }

    await this.applicationModelService.updateOne({ _id: id }, { $set: data });

    return {
      ...metric,
      ...data,
    };
  }

  public async updateOne(
    filters: FilterQuery<Application>,
    update: UpdateQuery<Application>,
    options?: QueryOptions,
  ) {
    return this.applicationModelService.updateOne(filters, update, options);
  }

  public async deleteById(id: Types.ObjectId): Promise<Application> {
    const metric = await this.applicationModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Application not found');
    }
    await this.applicationModelService.deleteOne({ _id: id });

    return metric;
  }

  public async createOrUpdate(application: Application): Promise<Application> {
    const existing = await this.applicationModelService.findOne({
      name: application.name,
    });
    if (!existing) {
      return this.applicationModelService.create(application);
    }
    return this.updateById(existing._id, application);
  }

  public async deleteMany(filters: FilterQuery<Application>) {
    await this.applicationModelService.deleteMany(filters);
  }
}
