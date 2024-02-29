import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CrudFindOneOptions, CrudListOptions, CrudModelService } from '../crud';
import { MetricSummary } from '../entities';

@Injectable()
export class SummaryService {
  private summaryModelService: CrudModelService<MetricSummary>;
  constructor(
    @InjectModel(MetricSummary.name)
    summaryModel: Model<MetricSummary>,
  ) {
    this.summaryModelService = new CrudModelService(summaryModel);
  }

  async getList(
    filters: FilterQuery<MetricSummary>,
    options?: CrudListOptions,
  ): Promise<MetricSummary[]> {
    return await this.summaryModelService.getList(filters, options);
  }

  async getCount(filters: FilterQuery<MetricSummary>): Promise<number> {
    return this.summaryModelService.getCount(filters);
  }

  async findById(id: Types.ObjectId, options?: CrudFindOneOptions) {
    return this.summaryModelService.findById(id, options);
  }

  public async create(metric: MetricSummary): Promise<MetricSummary> {
    return this.summaryModelService.create(metric);
  }

  public async updateById(
    id: Types.ObjectId,
    data: Partial<MetricSummary>,
  ): Promise<MetricSummary> {
    const metric = await this.summaryModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Metric Summary not found');
    }

    await this.summaryModelService.updateOne({ _id: id }, { $set: data });

    return {
      ...metric,
      ...data,
    };
  }

  public async delete(id: Types.ObjectId): Promise<MetricSummary> {
    const metric = await this.summaryModelService.findById(id);

    if (!metric) {
      throw new NotFoundException('Metric Summary not found');
    }
    await this.summaryModelService.deleteOne({ _id: id });

    return metric;
  }

  public async deleteMany(filters: FilterQuery<MetricSummary>) {
    return this.summaryModelService.deleteMany(filters);
  }

  public async getLatest(applicationId: Types.ObjectId) {
    return this.summaryModelService.findOne(
      { applicationId },
      { sort: { createdAt: -1 } },
    );
  }

  public async getLatestSummaries() {
    return this.summaryModelService.aggregate([
      {
        $group: {
          _id: '$applicationId',
          summary: {
            $last: '$$ROOT',
          },
        },
      },
      {
        $replaceRoot: { newRoot: '$summary' },
      },
    ]);
  }
}
