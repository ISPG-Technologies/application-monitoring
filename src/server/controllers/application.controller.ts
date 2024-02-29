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
import { ApiBearerAuth } from '@nestjs/swagger';
import * as escapeStringRegexp from 'escape-string-regexp';
import { FilterQuery } from 'mongoose';
import { JwtAuthGuard } from '../auth';
import { Application, MetricSummary } from '../entities';
import { ApplicationService } from '../services/application.service';
import { SummaryService } from '../services/summary.service';
import {
  ApiResponse,
  getPaginatedCounts,
  getPagination,
  PaginatedApiResponse,
  ParamsIdRequest,
  SearchWithPaginationRequestViewModel,
} from '../utils';

@Controller('api/application')
export class ApplicationController {
  @Inject() private applicationService: ApplicationService;
  @Inject() private summaryService: SummaryService;

  @Get()
  public async getList(
    @Query() query: SearchWithPaginationRequestViewModel,
  ): Promise<PaginatedApiResponse<Application>> {
    const filters: FilterQuery<Application> = {};
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
      this.applicationService.getCount(filters),
      this.applicationService.getList(filters, { pagination }),
    ]);

    return {
      status: HttpStatus.OK,
      data: list,
      ...getPaginatedCounts(count),
    };
  }

  @Get('/active')
  public async getActiveList(
    @Query() query: SearchWithPaginationRequestViewModel,
  ): Promise<PaginatedApiResponse<Application>> {
    const filters: FilterQuery<Application> = { isActive: true };
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
      this.applicationService.getCount(filters),
      this.applicationService.getList(filters, { pagination }),
    ]);

    return {
      status: HttpStatus.OK,
      data: list,
      ...getPaginatedCounts(count),
    };
  }

  @Get('/summaries')
  public async getApplicationSummaries(): Promise<
    ApiResponse<{ applications: Application[]; summaries: MetricSummary[] }>
  > {
    const applications = await this.applicationService.getList({});
    const summaries = await this.summaryService.getLatestSummaries();
    return { data: { applications, summaries }, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  public async create(
    @Body() data: Application,
  ): Promise<ApiResponse<Application>> {
    const metric = await this.applicationService.create(data);
    return { data: metric, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  public async update(
    @Param() params: ParamsIdRequest,
    @Body() data: Application,
  ): Promise<ApiResponse<Application>> {
    const metric = await this.applicationService.updateById(params.id, data);
    return { data: metric, status: HttpStatus.OK };
  }

  @Get(':id')
  public async readApplication(
    @Param() params: ParamsIdRequest,
  ): Promise<ApiResponse<Application>> {
    const metric = await this.applicationService.findById(params.id);
    return { data: metric, status: HttpStatus.OK };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  public async delete(
    @Param() params: ParamsIdRequest,
  ): Promise<ApiResponse<Application>> {
    const metric = await this.applicationService.deleteById(params.id);

    return { data: metric, status: HttpStatus.OK };
  }
}
