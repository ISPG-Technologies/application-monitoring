import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth';
import { IAppSettings } from '../interfaces';
import { AppSettingsService } from '../services/app-settings.service';
import { ApiResponse } from '../utils/response-models';
import {
  EmailSettingsDto,
  GeneralSettingsDto,
  SMSSettingsDto,
} from '../view-models';

@Controller('api/app-settings')
@ApiTags('App Settings')
@ApiBasicAuth()
export class AppSettingsController {
  @Inject() private appSettingsService: AppSettingsService;

  @UseGuards(JwtAuthGuard)
  @Get()
  public async getSettings(): Promise<ApiResponse<IAppSettings>> {
    const data = await this.appSettingsService.getAppSettings();
    return { data, status: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sms')
  public async updateSMSSettings(
    @Body() settings: SMSSettingsDto,
  ): Promise<ApiResponse<IAppSettings>> {
    await this.appSettingsService.updateSmsSettings(settings);
    const data = await this.appSettingsService.getAppSettings(true);
    return { data, status: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/general')
  public async updateGeneralSettings(
    @Body() settings: GeneralSettingsDto,
  ): Promise<ApiResponse<IAppSettings>> {
    await this.appSettingsService.updateGeneralSettings(settings);
    const data = await this.appSettingsService.getAppSettings(true);
    return { data, status: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/email')
  public async updateEmailSettings(
    @Body() settings: EmailSettingsDto,
  ): Promise<ApiResponse<IAppSettings>> {
    await this.appSettingsService.updateEmailSettings(settings);
    const data = await this.appSettingsService.getAppSettings(true);
    return { data, status: HttpStatus.OK };
  }
}
