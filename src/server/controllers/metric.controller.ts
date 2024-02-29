import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as escapeStringRegexp from 'escape-string-regexp';
import { FilterQuery } from 'mongoose';
import { JwtAuthGuard } from '../auth';
import { Metric, MetricSummary } from '../entities';
import { MetricService } from '../services/metric.service';
import { SummaryService } from '../services/summary.service';
import {
  ApiResponse,
  getPaginatedCounts,
  getPagination,
  PaginatedApiResponse,
  SearchWithPaginationRequestViewModel,
} from '../utils';
import {
  ApplicationIdQueryDto,
  MetricDto,
  ParamsIdRequest,
} from '../view-models';

@ApiTags('Metric')
@Controller('api/metric')
export class MetricController {
  @Inject() private metricService: MetricService;
  @Inject() private metricSummaryService: SummaryService;

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Get()
  public async getList(
    @Query() query: SearchWithPaginationRequestViewModel,
  ): Promise<PaginatedApiResponse<Metric>> {
    const filters: FilterQuery<Metric> = {};
    if (query.query) {
      filters.$or = [
        {
          application: {
            $regex: escapeStringRegexp(query.query),
            $options: 'si',
          },
          name: {
            $regex: escapeStringRegexp(query.query),
            $options: 'si',
          },
        },
      ];
    }

    const pagination = getPagination(query);

    const [count, list] = await Promise.all([
      this.metricService.getCount(filters),
      this.metricService.getList(filters, {
        pagination,
        populate: [{ path: 'applicationId' }],
      }),
    ]);

    return {
      status: HttpStatus.OK,
      data: list,
      ...getPaginatedCounts(count, pagination),
    };
  }

  @Get('/active')
  public async getActiveList(
    @Query() query: SearchWithPaginationRequestViewModel,
  ): Promise<PaginatedApiResponse<Metric>> {
    const filters: FilterQuery<Metric> = { isActive: true };
    if (query.query) {
      filters.$or = [
        {
          application: {
            $regex: escapeStringRegexp(query.query),
            $options: 'si',
          },
          name: {
            $regex: escapeStringRegexp(query.query),
            $options: 'si',
          },
        },
      ];
    }

    const pagination = getPagination(query);

    const [count, list] = await Promise.all([
      this.metricService.getCount(filters),
      this.metricService.getList(filters, {
        pagination,
        populate: [{ path: 'applicationId' }],
      }),
    ]);

    return {
      status: HttpStatus.OK,
      data: list,
      ...getPaginatedCounts(count),
    };
  }

  @Get('/summary/latest')
  public async getLatestSummary(
    @Query() query: ApplicationIdQueryDto,
  ): Promise<ApiResponse<MetricSummary>> {
    const summary = await this.metricSummaryService.getLatest(
      query.applicationId,
    );
    return {
      status: HttpStatus.OK,
      data: summary,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  public async create(@Body() data: MetricDto): Promise<ApiResponse<Metric>> {
    const metric = await this.metricService.create(data);
    return { data: metric, status: HttpStatus.OK };
  }

  @Get(':id')
  public async get(
    @Param() params: ParamsIdRequest,
  ): Promise<ApiResponse<Metric>> {
    const metric = await this.metricService.findById(params.id);
    return { data: metric, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  public async update(
    @Param() params: ParamsIdRequest,
    @Body() data: MetricDto,
  ): Promise<ApiResponse<Metric>> {
    const metric = await this.metricService.updateById(params.id, data);
    return { data: metric, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  public async delete(
    @Param() params: ParamsIdRequest,
  ): Promise<ApiResponse<Metric>> {
    const metric = await this.metricService.deleteById(params.id);

    return { data: metric, status: HttpStatus.OK };
  }
}
