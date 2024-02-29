import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CrudListOptions, CrudModelService } from '../crud';
import { MetricHistory } from '../entities';

@Injectable()
export class HistoryService {
  private metricHistoryModelService: CrudModelService<MetricHistory>;
  constructor(
    @InjectModel(MetricHistory.name)
    metricHistoryModel: Model<MetricHistory>,
  ) {
    this.metricHistoryModelService = new CrudModelService(metricHistoryModel);
  }

  async getList(
    filters: FilterQuery<MetricHistory>,
    options?: CrudListOptions,
  ): Promise<MetricHistory[]> {
    return await this.metricHistoryModelService.getList(filters, options);
  }

  async getCount(filters: FilterQuery<MetricHistory>): Promise<number> {
    return this.metricHistoryModelService.getCount(filters);
  }

  public async create(metric: MetricHistory): Promise<MetricHistory> {
    return this.metricHistoryModelService.create(metric);
  }

  public async deleteMany(filters: FilterQuery<MetricHistory>) {
    return this.metricHistoryModelService.deleteMany(filters);
  }
}
