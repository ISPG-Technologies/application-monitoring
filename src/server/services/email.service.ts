import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgendaService } from 'nestjs-agenda';
import * as nodemailer from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';
import { CrudModelService } from '../crud';
import { EmailRequests } from '../entities';
import { AppSettingsService } from './app-settings.service';

@Injectable()
export class EmailService {
  static readonly SEND_EMAIL_NOTIFICATION_JOB = 'Email - notification';

  private emailRequestModelService: CrudModelService<EmailRequests>;

  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly agenda: AgendaService,
    private appSettingsService: AppSettingsService,
    @InjectModel(EmailRequests.name)
    emailRequestModel: Model<EmailRequests>,
  ) {
    this.emailRequestModelService = new CrudModelService(emailRequestModel);

    this.agenda.define(
      EmailService.SEND_EMAIL_NOTIFICATION_JOB,
      {},
      this.handleAgendaEmailJob.bind(this),
    );
  }
  async sendMail(
    fromText: string,
    to: string,
    subject: string,
    content: string,
    ccEmailList?: string[],
    attachments?: Attachment[],
  ) {
    ccEmailList = ccEmailList?.filter((email) => email !== to);
    const req = await this.emailRequestModelService.create({
      to,
      subject,
      content,
    });
    const options = {
      from: undefined,
      to,
      subject,
      html: content,
      attachments,
      cc: ccEmailList,
    };
    try {
      const appSettings = await this.appSettingsService.getAppSettings();
      if (!appSettings.email?.configured) {
        throw new NotImplementedException('SMTP not configured');
      }
      const transporter = nodemailer.createTransport({
        host: appSettings.email.host,
        port: appSettings.email.port,
        secure: appSettings.email.ssl,
        auth: {
          user: appSettings.email.username,
          pass: appSettings.email.password,
        },
        // requireTLS: true,
        // tls: {
        //   ciphers: 'TLSv1.2',
        // },
      });
      options.from = `${fromText} <${appSettings.email?.from}>`;
      const info = await transporter.sendMail(options);
      this.logger.log(`Message Sent ${info?.response}`);
      await this.emailRequestModelService.updateOne(
        { _id: req._id },
        { $set: { send: true, response: info?.response } },
      );
    } catch (error) {
      this.logger.error(`error: ${error.message}`, error.stack);
      await this.emailRequestModelService.updateOne(
        { _id: req._id },
        {
          $set: {
            failed: true,
            response: error.message,
            errorMessage: error.message,
            stack: error.stack,
          },
        },
      );
    }
  }

  public async handleAgendaEmailJob(job: any, done: () => void) {
    const data = job.attrs.data;
    await this.sendMail(
      data.applicationTitle,
      data.recipient,
      data.subject,
      data.content,
      data.ccEmailList,
    );
    done();
  }
}
