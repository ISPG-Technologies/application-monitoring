import { forwardRef, Inject, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { AgendaService } from 'nestjs-agenda';
import { Application, MetricHistory, MetricSummary } from '../entities';
import { AppSettingsService } from './app-settings.service';
import { EmailService } from './email.service';

export class NotifierService {
  private logger = new Logger(NotifierService.name);

  constructor(
    private agenda: AgendaService,
    @Inject(forwardRef(() => AppSettingsService))
    private appSettingsService: AppSettingsService,
  ) {}

  private generateTableForEmail(headers: string[], content: string[][]) {
    return `
      <table width="100%" valign="middle" cellspacing="0" cellpadding="12" style="font-size: 15px;">
        <thead>
          <tr>
          ${headers
            .map((header) => {
              return `<th  style="text-align: center" bgcolor="#f5f5f5"><font face="ProximaNova">${header}</font></th>`;
            })
            .join('')}
          </tr>
        </thead>
        <tbody>
        ${content
          .map((row) => {
            return `<tr>
            ${row
              .map((data) => {
                return `<td style="text-align: center"><font face="ProximaNova">${data}</font></td>`;
              })
              .join('')}
          </tr>`;
          })
          .join('')}
        </tbody>
      </table>
      <br/>
    `;
  }

  public async notify(
    application: Application,
    summary: MetricSummary,
    previous?: MetricSummary,
  ) {
    if (!application?.emailEnabled) {
      this.logger.log('Email Is Disabled');
      return;
    }

    this.logger.log('Starting Notifier');
    const justDownMetrics = summary.metrics?.filter(
      (met) => met.previousHealth?.isHealthy && !met.health?.isHealthy,
    );
    if (justDownMetrics?.length) {
      this.logger.log('Notifying just down metrics');
      await this.downNotifier(application, summary, justDownMetrics);
    }
    if (
      !summary.previousHealth?.allFatalMetricsHealthy &&
      summary.health?.allFatalMetricsHealthy
    ) {
      this.logger.log('Notifying all up');
      await this.upNotifier(
        application,
        summary.createdAt?.getTime() -
          previous.sameFatalMetricsStatusSince?.getTime(),
      );
    }
    this.logger.log('Ending Notifier');
  }

  async downNotifier(
    application: Application,
    summary: MetricSummary,
    metrics: MetricHistory[],
  ) {
    if (!metrics.length) {
      return;
    }
    if (!application?.emailEnabled) {
      this.logger.log('Email Is Disabled');
      return;
    }

    const services = [...new Set(metrics?.map((metr) => metr.metric.service))];

    const content = `
    <table border="0" cellpadding="0" cellspacing="0" bgcolor="#fffffe" width="100%" role="presentation" style="margin: 0 auto; padding: 0; color: #666; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8" class="full">
      <tr>
          <td width="100%" valign="middle" style="padding: 30px;" class="smallPad">
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 19px; line-height: 23px; font-weight: 600; margin: 0">Hi,</p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> The <b>${
                  application?.name || 'application'
                }</b> is currently <b>DOWN</b></p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> Following services are down at the moment.</p>
                <br /> 
            </font>
            ${this.generateTableForEmail(
              ['Date', 'Time', 'Service', 'Metrics', 'Status'],
              services.map((app) => [
                moment(summary.createdAt).format('DD-MMM-YYYY'),
                moment(summary.createdAt).format('hh:mm A'),
                app,
                `${
                  metrics.filter((met) => met.metric.service === app)?.length
                }/${
                  summary.metrics.filter((met) => met.metric.service === app)
                    ?.length
                }`,
                'Down',
              ]),
            )}
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> Uptime Monitor will alert you when it is back up.<br /> <b>${
                  application?.title
                }.</b> </p>
                <br /> 
            </font>
          </td>
      </tr>
    </table>
    `;

    await this.agenda.schedule(
      'in 10 seconds',
      EmailService.SEND_EMAIL_NOTIFICATION_JOB,
      {
        applicationTitle: application?.title,
        recipient: application?.notifyEmails?.join(),
        subject: `Service is Down`,
        content,
        ccEmailList: application?.notifyCCEmails,
      },
    );
  }

  async upNotifier(application: Application, downTimeInMilliseconds: number) {
    if (!application?.emailEnabled) {
      this.logger.log('Email Is Disabled');
      return;
    }

    const downTime = this.msToTime(downTimeInMilliseconds);

    const content = `
    <table border="0" cellpadding="0" cellspacing="0" bgcolor="#fffffe" width="100%" role="presentation" style="margin: 0 auto; padding: 0; color: #666; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8" class="full">
      <tr>
          <td width="100%" valign="middle" style="padding: 30px;" class="smallPad">
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 19px; line-height: 23px; font-weight: 600; margin: 0">Hi,</p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> The uptime monitor <b>${
                  application.name || 'application'
                }</b> is back <b>UP</b> (It was down for ${downTime})</p>
                <br /> 
            </font>
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> Have a great day,<br /> <b>${
                  application.title
                }.</b> </p>
                <br /> 
            </font>
          </td>
      </tr>
    </table>
    `;

    await this.agenda.schedule(
      'in 10 seconds',
      EmailService.SEND_EMAIL_NOTIFICATION_JOB,
      {
        applicationTitle: application?.title,
        recipient: application?.notifyEmails?.join(),
        subject: `Services are UP`,
        content,
        ccEmailList: application?.notifyCCEmails,
      },
    );
  }

  async currentStatusNotifier(
    application: Application,
    summary: MetricSummary,
  ) {
    const appSettings = await this.appSettingsService.getAppSettings();
    const totalCount = summary.metrics?.length;
    const healthyCount = summary.metrics.filter(
      (met) => !met.health || met.health?.isHealthy,
    ).length;
    const healthMessage =
      totalCount === healthyCount
        ? 'All good'
        : `${totalCount - healthyCount} out of ${totalCount} metrics are DOWN`;

    const content = `
    <table border="0" cellpadding="0" cellspacing="0" bgcolor="#fffffe" width="100%" role="presentation" style="margin: 0 auto; padding: 0; color: #666; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8" class="full">
      <tr>
          <td width="100%" valign="middle" style="padding: 30px;" class="smallPad">
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 19px; line-height: 23px; font-weight: 600; margin: 0">Hi,</p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> The current status of <b>${
                  application?.name || 'application'
                }</b> is as follows</p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0">Status: <b>${healthMessage}</b></p>
                <br /> 
            </font>
            ${this.generateTableForEmail(
              ['Time', 'Service', 'Metric', 'Status', 'Status Since'],
              summary?.metrics?.map((metric) => [
                moment(summary.createdAt).format('hh:mm A'),
                metric.metric?.service,
                metric.metric.name,
                metric.health?.isHealthy ? 'Up' : 'Down',
                moment(metric.sameStatusSince).fromNow(true),
              ]),
            )}
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0">Regards, <br /> <b>${
                  application?.title
                }.</b> </p>
                <br /> 
            </font>
          </td>
      </tr>
    </table>
    `;

    await this.agenda.schedule(
      'in 10 seconds',
      EmailService.SEND_EMAIL_NOTIFICATION_JOB,
      {
        applicationTitle: application?.title,
        recipient: application?.notifyEmails?.join(),
        subject: `Status Report`,
        content,
        ccEmailList: application?.notifyCCEmails,
      },
    );
  }

  async consolidatedSummaryNotifier(
    application: Application,
    startDate: Date,
    endDate: Date,
    summaries: MetricSummary[],
    current: MetricSummary,
  ) {
    const allMetrics = summaries.reduce((all, summary) => {
      all.push(...summary.metrics);
      return all;
    }, [] as MetricHistory[]);
    const metricIds = [
      ...new Set(allMetrics.map((met) => met.metricId.toString())),
    ];
    const services = [...new Set(allMetrics.map((met) => met.metric?.service))];

    const metrics = metricIds.map((metId) => {
      return {
        metric: allMetrics.find((met) => met.metricId?.toString() === metId),
        downTime: this.calculateTotalDownTime(
          allMetrics.filter((met) => met.metricId?.toString() === metId),
        ),
        currentHealth: current.metrics?.find(
          (met) => met.metricId?.toString() === metId,
        )?.health,
      };
    });
    const content = `
    <table border="0" cellpadding="0" cellspacing="0" bgcolor="#fffffe" width="100%" role="presentation" style="margin: 0 auto; padding: 0; color: #666; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8" class="full">
      <tr>
          <td width="100%" valign="middle" style="padding: 30px;" class="smallPad">
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 19px; line-height: 23px; font-weight: 600; margin: 0">Hi,</p>
                <br /> 
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0"> The consolidated reports of each metrics From <b>${moment(
                  startDate,
                ).format('DD-MMM-YYYY hh:mm A')}</b> to  From <b>${moment(
      endDate,
    ).format('DD-MMM-YYYY hh:mm A')}</b> in <b>${
      application?.name || 'application'
    }</b> is as follows</p>
                <br /> 
            </font>
            ${services
              .map(
                (app) => `
            ${this.generateTableForEmail(
              ['Service', 'Metric', 'Downtime', 'Status'],
              metrics
                .filter((met) => met.metric?.metric?.service === app)
                ?.map((metric) => [
                  metric.metric?.metric?.service,
                  metric.metric?.metric?.name,
                  metric.downTime ? this.msToTime(metric.downTime) : '',
                  metric.currentHealth
                    ? metric.currentHealth?.isHealthy
                      ? 'Up'
                      : 'Down'
                    : '',
                ]),
            )}
            `,
              )
              .join('<br/>')}
            
            <font face="ProximaNova">
                <p style="color: #282828; font-size: 15px; line-height: 23px; margin: 0">Regards, <br /> <b>${
                  application?.title
                }.</b> </p>
                <br /> 
            </font>
          </td>
      </tr>
    </table>
    `;

    await this.agenda.schedule(
      'in 10 seconds',
      EmailService.SEND_EMAIL_NOTIFICATION_JOB,
      {
        applicationTitle: application?.title,
        recipient: application?.notifyEmails?.join(),
        subject: `Consolidated Report`,
        content,
        ccEmailList: application?.notifyCCEmails,
      },
    );
  }

  private calculateTotalDownTime(histories: MetricHistory[]): number {
    return histories
      .sort((h1, h2) => h1.updatedAt?.getTime() - h2.updatedAt?.getTime())
      .reduce(
        (data, h) => {
          return {
            time:
              data.time +
              (data.last && !h.health.isHealthy
                ? h.createdAt.getTime() - data.last.getTime()
                : 0),
            last: !h.health.isHealthy ? h.sameStatusSince : undefined,
          };
        },
        { time: 0, last: undefined } as {
          time: number;
          last: Date | undefined;
        },
      ).time;
  }

  private msToTime(duration: number) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const parts: string[] = [];

    if (hours) {
      parts.push(`${hours} hrs`);
    }
    if (minutes) {
      parts.push(`${minutes} mins`);
    }

    if (seconds) {
      parts.push(`${seconds} secs`);
    }

    if (parts.length === 0) {
      return '0 secs';
    }
    if (parts.length === 1) {
      return parts[0];
    }

    const last = parts.splice(parts.length - 1, 1);

    return `${parts.join(' ')} and ${last}`;
  }
}
