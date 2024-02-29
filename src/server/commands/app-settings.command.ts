import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { AppSettingsKey } from '../entities';
import { AppSettingsService } from '../services/app-settings.service';
import { EmailSettingsDto } from '../view-models';

@Injectable()
export class LoadAppSettingsCommand {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Command({
    command: 'load:appsettings',
    describe: 'load app settings',
  })
  async load() {
    // General
    console.log(
      `Creating app settings value for ${AppSettingsKey.GENERAL_SETTINGS}`,
    );
    await this.create(AppSettingsKey.GENERAL_SETTINGS, {
      timezone: 'Asia/Calcutta',
    });

    // SMS
    console.log(
      `Creating app settings value for ${AppSettingsKey.SMS_SETTINGS}`,
    );
    await this.create(AppSettingsKey.SMS_SETTINGS, {
      sendSms: false,
    });

    // Email
    console.log(
      `Creating app settings value for ${AppSettingsKey.EMAIL_SETTINGS}`,
    );
    const emailSettigs: EmailSettingsDto = {
      from: '',
      host: '',
      password: '',
      username: '',
      port: 465,
      ssl: true,
    };
    await this.create(AppSettingsKey.EMAIL_SETTINGS, emailSettigs);

    process.exit(0);
  }

  async create(key: AppSettingsKey, value: any) {
    await this.appSettingsService.createOrUpdateAppSettings(key, value);
  }
}
