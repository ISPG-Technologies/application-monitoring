import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsDefined,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import * as escapeStringRegexp from 'escape-string-regexp';
import { AgendaService } from 'nestjs-agenda';
import { JwtAuthGuard } from '../auth';
import { Dict } from '../interfaces';
import {
  addPaginationToQuery,
  getPagination,
  SearchWithPaginationRequestViewModel,
} from '../utils';

class ScheduleSystemTaskDto {
  @ApiProperty()
  @IsDefined()
  task: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  data: any;
}

class SystemTasksRequestModel extends SearchWithPaginationRequestViewModel {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

@Controller('api/tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
export class TasksController {
  @Inject() agendaService: AgendaService;

  @UseGuards(JwtAuthGuard)
  @Get('/repeated')
  async getRepeatedTasks() {
    const data = await this.agendaService.jobs({
      repeatInterval: { $exists: true },
      type: 'single',
    });
    return { data, status: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/normal')
  async getNormalTasks(@Query() query: SystemTasksRequestModel) {
    const model = (this.agendaService as any)._collection;
    const filters: Dict = {
      type: 'normal',
    };
    if (query.query) {
      filters.name = {
        $regex: escapeStringRegexp(query.query),
        $options: 'si',
      };
    }
    let dbQquery = model.find(filters);
    const pagination = getPagination(query);
    const count = await dbQquery.count();
    dbQquery = addPaginationToQuery(dbQquery, pagination);
    const sort: any = query.sortBy
      ? {
          [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1,
        }
      : {
          _id: -1,
        };
    dbQquery = dbQquery.sort(sort);
    const data = await dbQquery.toArray();

    return {
      data,
      count,
      page: pagination?.page || 1,
      perPage: pagination?.perPage || count,
      totalPages:
        count === 0 ? 0 : Math.ceil(count / (pagination?.perPage || count)),
      status: HttpStatus.OK,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/schedule')
  async scheduleTask(@Body() body: ScheduleSystemTaskDto) {
    await this.agendaService.schedule('in 10 seconds', body.task, body.data);
    const data = await this.agendaService.jobs({});
    return { data, status: HttpStatus.OK };
  }
}
