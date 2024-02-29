import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as escapeStringRegexp from 'escape-string-regexp';
import { FilterQuery } from 'mongoose';
import { MetricHistory } from '../entities';
import { HistoryService } from '../services/history.service';
import {
  getPaginatedCounts,
  getPagination,
  PaginatedApiResponse,
} from '../utils';
import { GetMetricHistoryDto } from '../view-models';

@ApiTags('History')
@Controller('api/history')
export class HistoryController {
  @Inject() private historyService: HistoryService;

  @Get()
  public async getList(
    @Query() query: GetMetricHistoryDto,
  ): Promise<PaginatedApiResponse<MetricHistory>> {
    const filters: FilterQuery<MetricHistory> = {};
    if (query.query) {
      filters.$or = [
        {
          'metric.name': {
            $regex: escapeStringRegexp(query.query),
            $options: 'si',
          },
        },
      ];
    }

    if (query.startDate || query.endDate) {
      const dateFilter: FilterQuery<MetricHistory>['createdAt'] = {};
      if (query.endDate) {
        dateFilter.$lte = query.endDate;
      }
      if (query.startDate) {
        dateFilter.$gte = query.startDate;
      }

      filters.createdAt = dateFilter;
    }

    if (query.metricId) {
      filters.metricId = query.metricId;
    }

    if (query.application) {
      filters['metric.application'] = query.application;
    }

    const pagination = getPagination(query);

    const [count, list] = await Promise.all([
      this.historyService.getCount(filters),
      this.historyService.getList(filters, { pagination }),
    ]);

    return {
      status: HttpStatus.OK,
      data: list,
      ...getPaginatedCounts(count),
    };
  }
}
