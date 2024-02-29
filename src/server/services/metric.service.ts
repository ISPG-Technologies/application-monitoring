import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CrudFindOneOptions, CrudListOptions, CrudModelService } from '../crud';
import { Metric } from '../entities';
import { ApplicationService } from './application.service';

@Injectable()
export class MetricService {
  private metricModelService: CrudModelService<Metric>;
  constructor(
    @InjectModel(Metric.name)
    metricModel: Model<Metric>,
    private applicationService: ApplicationService,
  ) {
    this.metricModelService = new CrudModelService(metricModel);
  }

  async getList(
    filters: FilterQuery<Metric>,
    options?: CrudListOptions,
  ): Promise<Metric[]> {
    return await this.metricModelService.getList(filters, options);
  }

  async getCount(filters: FilterQuery<Metric>): Promise<number> {
    return this.metricModelService.getCount(filters);
  }

  async findById(id: Types.ObjectId, options?: CrudFindOneOptions) {
    return this.metricModelService.findById(id, options);
  }

  public async create(metric: Metric): Promise<Metric> {
    const created = await this.metricModelService.create(metric);
    await this.applicationService.updateOne(
      { _id: metric.applicationId },
      { $inc: { numberOfMetrics: 1 } },
    );
    return created;
  }

  public async createOrUpdate(metric: Metric): Promise<Metric> {
    const existing = await this.metricModelService.findOne({
      service: metric.service,
      name: metric.name,
      applicationId: metric.applicationId,
    });
    if (!existing) {
      return this.create(metric);
    }
    return this.updateById(existing._id, metric);
  }

  public async updateById(
    id: Types.ObjectId,
    data: Partial<Metric>,
  ): Promise<Metric> {
    const metric = await this.metricModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    await this.metricModelService.updateOne({ _id: id }, { $set: data });

    return {
      ...metric,
      ...data,
    };
  }

  public async deleteById(id: Types.ObjectId): Promise<Metric> {
    const metric = await this.metricModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Metric not found');
    }
    await this.metricModelService.deleteOne({ _id: id });
    await this.applicationService.updateOne(
      { _id: metric.applicationId },
      { $inc: { numberOfMetrics: -1 } },
    );

    return metric;
  }

  public async deleteMany(filters: FilterQuery<Metric>) {
    await this.metricModelService.deleteMany(filters);
  }
}
