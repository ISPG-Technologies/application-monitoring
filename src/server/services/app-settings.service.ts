import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CacheService } from '../cache';
import { AppSettings, AppSettingsKey } from '../entities/app-settings.entity';
import { IAppSettings } from '../interfaces';
import {
  EmailSettingsDto,
  GeneralSettingsDto,
  SMSSettingsDto,
} from '../view-models';

@Injectable()
export class AppSettingsService {
  @InjectModel(AppSettings.name)
  private appSettingsModel: Model<AppSettings>;
  @Inject() private cacheService: CacheService;

  private getEntryValue(entries: AppSettings[], key: AppSettingsKey) {
    return entries.find((entry) => entry.key === key)?.value;
  }

  async getAppSettings(reload?: boolean): Promise<IAppSettings> {
    return await this.cacheService.getCache<IAppSettings>(
      `common:app-settings`,
      {
        fallback: this.getAppSettingsFromDatabse.bind(this),
        timeoutInSeconds: 86400,
        reload,
      },
    );
  }

  private async getAppSettingsFromDatabse(): Promise<IAppSettings> {
    const entries = await this.appSettingsModel.find({ isActive: true });
    const generalSettings: GeneralSettingsDto = this.getEntryValue(
      entries,
      AppSettingsKey.GENERAL_SETTINGS,
    );
    const settings: IAppSettings = {
      timezone: generalSettings?.timezone,
      sms: this.getEntryValue(entries, AppSettingsKey.SMS_SETTINGS),
      email: this.getEntryValue(entries, AppSettingsKey.EMAIL_SETTINGS),
    };

    if (settings.email) {
      settings.email.configured = !!(
        settings.email?.host &&
        settings.email?.from &&
        settings.email?.port &&
        settings.email?.username &&
        settings.email?.password
      );
    }

    if (settings.sms) {
      settings.sms.configured = !!(
        settings.sms.accountId &&
        settings.sms.password &&
        settings.sms.senderId &&
        settings.sms.username
      );
    }

    return settings;
  }

  async createOrUpdateAppSettings(key: AppSettingsKey, value: any) {
    const existing = await this.appSettingsModel
      .findOne({
        key,
      })
      .lean();
    if (existing) {
      await this.appSettingsModel.updateOne(
        { key },
        { $set: { key, value, isActive: true } },
      );
      return this.appSettingsModel.findOne({ key }).lean();
    }
    return this.appSettingsModel.create({ key, value, isActive: true });
  }

  async updateSmsSettings(data: SMSSettingsDto) {
    await this.createOrUpdateAppSettings(AppSettingsKey.SMS_SETTINGS, data);
  }

  async updateEmailSettings(data: EmailSettingsDto) {
    await this.createOrUpdateAppSettings(AppSettingsKey.EMAIL_SETTINGS, data);
  }

  async updateGeneralSettings(data: GeneralSettingsDto) {
    await this.createOrUpdateAppSettings(AppSettingsKey.GENERAL_SETTINGS, {
      timezone: data.timezone,
    });
  }
}
