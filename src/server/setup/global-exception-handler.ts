import { Logger } from '@nestjs/common';
import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ApiConfigService } from '../config/api-config-service';
import { sendApiErrorToSlack } from '../utils';

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  private logger = new Logger(GlobalExceptionsFilter.name);
  constructor(
    private apiConfigService: ApiConfigService,
    private sendResponse: (res: any, status: HttpStatus, data: any) => void,
  ) {
    super();
  }

  catch(exception: any, host: ArgumentsHost) {
    if (this.apiConfigService.debug) {
      // tslint:disable:no-console
      console.log(exception);
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception.status as HttpStatus) || HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      status === HttpStatus.FORBIDDEN
        ? exception.message || "You don't have permission to do this"
        : exception instanceof HttpException || this.apiConfigService.debug
        ? exception.message
        : 'Something went wrong';

    const res = {
      message,
      data: exception.response,
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.sendResponse(response, status, res);

    if (
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
      !this.apiConfigService.debug
    ) {
      this.logger.error(exception, exception?.message, exception?.stack);

      sendApiErrorToSlack(
        this.apiConfigService.slack.webhookUrl,
        request,
        exception,
      );
    }
  }
}
