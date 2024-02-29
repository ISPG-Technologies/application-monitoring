import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { AgendaService } from 'nestjs-agenda';
import { stringify } from 'querystring';
import { CrudModelService } from '../crud';
import { SMSRequests } from '../entities';
import { AppSettingsService } from './app-settings.service';

@Injectable()
export class SmsService {
  static readonly SEND_SMS_NOTIFICATION_JOB = 'SMS - notification';

  private smsRequestModelService: CrudModelService<SMSRequests>;

  private readonly logger = new Logger(SmsService.name);
  constructor(
    private readonly agenda: AgendaService,
    private appSettingsService: AppSettingsService,
    @InjectModel(SMSRequests.name)
    smsRequestModel: Model<SMSRequests>,
  ) {
    this.smsRequestModelService = new CrudModelService(smsRequestModel);

    this.agenda.define(
      SmsService.SEND_SMS_NOTIFICATION_JOB,
      {},
      this.handleAgendaSMSJob.bind(this),
    );
  }

  async sendSMS(
    to: string,
    message: string,
    language: 'Arabic' | 'English' = 'English',
  ) {
    const appSettings = await this.appSettingsService.getAppSettings();
    const req = await this.smsRequestModelService.create({
      to,
      message,
      language,
    });
    if (to) {
      try {
        if (!appSettings.sms.configured) {
          throw new NotImplementedException('SMS account not configured');
        }
        const url = `https://trxnc.future-club.com/Bulksmswebservice/SmsService.asmx/SendSMS`;
        const response = await axios({
          method: 'POST',
          url,
          data: stringify({
            Msisdn: to.replace(new RegExp('^\\+'), ''),
            Msg: message,
            Lang: language == 'Arabic' ? 'A' : 'L',
            SenderID: appSettings.sms.senderId,
            UName: appSettings.sms.username,
            Password: appSettings.sms.password,
            AccountID: appSettings.sms.accountId,
            TransactionID: req._id.toString(),
          }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const parsed = response.data;
        await this.smsRequestModelService.updateOne(
          { _id: req._id },
          { $set: { send: true, response: parsed?.string } },
        );
        this.logger.log('Text sent! Message SID: ' + response.data);
      } catch (error) {
        await this.smsRequestModelService.updateOne(
          { _id: req._id },
          {
            $set: {
              failed: true,
              errorMessage: error.message,
              stack: error.stack,
              response: error.response?.data?.toString(),
            },
          },
        );
        this.logger.error(`error: ${error.message}`, error.stack);
      }
    }
  }

  public async handleAgendaSMSJob(job: any, done: () => void) {
    const data = job.attrs.data;
    await this.sendSMS(data.recipient, data.content);
    done();
  }
}
