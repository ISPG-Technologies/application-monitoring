import { Inject, Logger } from '@nestjs/common';
import { Job } from 'agenda';
import axios from 'axios';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AgendaService } from 'nestjs-agenda';
import { ApiConfigService } from '../config';
import { Application, Metric, MetricSummary, MetricType } from '../entities';
import { ErrorType, Health } from '../entities/health.entiry';
import { sendTaskErrorToSlack } from '../utils';
import { promiseTimeout, TimeoutError } from '../utils/promise';
import { ApplicationService } from './application.service';
import { HistoryService } from './history.service';
import { MetricService } from './metric.service';
import { NotifierService } from './notifier.service';
import { SummaryService } from './summary.service';

export class MonitoringService {
  static readonly AGENDA_SYNC_JOB_NAME = 'Sync Health';
  static readonly AGENDA_DAILY_NOTIFIER_JOB_NAME = 'Daily Notifier';
  static readonly AGENDA_CONSOLIDATED_SUMMARY_JOB_NAME =
    'Daily ConsolidatedSummary';
  private logger = new Logger(MonitoringService.name);

  constructor(
    @Inject(AgendaService)
    private readonly agenda: AgendaService,
    private metricService: MetricService,
    private historyService: HistoryService,
    private summaryService: SummaryService,
    private notifierService: NotifierService,
    private applicationService: ApplicationService,
    private apiConfigService: ApiConfigService,
  ) {
    this.agenda.define(
      MonitoringService.AGENDA_SYNC_JOB_NAME,
      { lockLifetime: 3 * 60 * 1000 },
      this.syncMetricHealth.bind(this),
    );
    this.agenda.every('3 minutes', MonitoringService.AGENDA_SYNC_JOB_NAME);

    this.agenda.define(
      MonitoringService.AGENDA_DAILY_NOTIFIER_JOB_NAME,
      { lockLifetime: 60 * 1000 },
      this.sendCurrentStatus.bind(this),
    );
    this.agenda.every(
      '0 9 * * *',
      MonitoringService.AGENDA_DAILY_NOTIFIER_JOB_NAME,
      {},
      { timezone: 'Asia/Calcutta' },
    );

    this.agenda.define(
      MonitoringService.AGENDA_CONSOLIDATED_SUMMARY_JOB_NAME,
      { lockLifetime: 60 * 1000 },
      this.sendConsolidatedSummary.bind(this),
    );
    this.agenda.every(
      '0 18 * * *',
      MonitoringService.AGENDA_CONSOLIDATED_SUMMARY_JOB_NAME,
      {},
      { timezone: 'Asia/Calcutta' },
    );
  }

  async sendCurrentStatus(job: Job, done: (error?: Error) => void) {
    try {
      const applications = await this.applicationService.getList({
        isActive: true,
      });
      await Promise.all(
        applications.map(async (application) => {
          try {
            const summary = await this.summaryService.getLatest(
              application._id,
            );
            await this.notifierService.currentStatusNotifier(
              application,
              summary,
            );
          } catch (e) {
            this.logger.error(e.message, e.stack);
            sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
              name: MonitoringService.AGENDA_DAILY_NOTIFIER_JOB_NAME,
              application: application.name,
            });
          }
        }),
      );

      done();
    } catch (e) {
      this.logger.error(e.message, e.stack);
      sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
        name: MonitoringService.AGENDA_DAILY_NOTIFIER_JOB_NAME,
        application: '--',
      });
      done(e);
    }
  }

  async sendConsolidatedSummary(job: Job, done: (error?: Error) => void) {
    try {
      const applications = await this.applicationService.getList(
        { isActive: true },
        { select: 'name title description' },
      );
      await Promise.all(
        applications.map((application) =>
          this._sendApplicationConsolidatedSummary(application),
        ),
      );
      done();
    } catch (e) {
      this.logger.error(e.message, e.stack);
      sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
        name: MonitoringService.AGENDA_CONSOLIDATED_SUMMARY_JOB_NAME,
        application: '--',
      });
      done(e);
    }
  }

  private async _sendApplicationConsolidatedSummary(application: Application) {
    try {
      const latest = await this.summaryService.getLatest(application._id);
      const endDate = new Date();
      const startDate = moment(endDate).subtract(1, 'days').toDate();
      const summaries = await this.summaryService.getList({
        createdAt: { $lte: endDate, $gt: startDate },
      });
      await this.notifierService.consolidatedSummaryNotifier(
        application,
        startDate,
        endDate,
        summaries,
        latest,
      );
    } catch (e) {
      this.logger.error(e.message, e.stack);
      sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
        name: MonitoringService.AGENDA_CONSOLIDATED_SUMMARY_JOB_NAME,
        application: application.name,
      });
    }
  }

  async syncMetricHealth(job: Job, done: (error?: Error) => void) {
    try {
      this.logger.log('Health Sync Started');
      const applications = await this.applicationService.getList(
        { isActive: true },
        { select: 'name title description' },
      );
      await Promise.all(
        applications.map((application) => this._syncMetricHealth(application)),
      );

      this.logger.log('Health Sync Completed');
      done();
    } catch (e) {
      this.logger.error(e.message, e.stack);
      sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
        name: MonitoringService.AGENDA_SYNC_JOB_NAME,
        application: '--',
      });
      done(e);
    }
  }

  private async _syncMetricHealth(application: Application) {
    try {
      this.logger.log(
        `Health Sync Started for application ${application.name}`,
      );
      const latestSummary = await this.summaryService.getLatest(
        application._id,
      );
      const summary: MetricSummary = {
        applicationId: application._id,
        applicationName: application.name,
        metrics: [],
        notified: false,
      };
      const metrics = await this.metricService.getList({
        isActive: true,
        applicationId: application._id,
      });
      this.logger.log(`${metrics.length} metrics found`);
      if (metrics.length) {
        await Promise.all(
          metrics.map((metric) =>
            this.processMetricHealth(application, summary, metric),
          ),
        );
      }

      await this.createSummary(application, summary, latestSummary);

      this.logger.log(
        `Health Sync Completed for application ${application.name}`,
      );
    } catch (e) {
      this.logger.error(e.message, e.stack);
      sendTaskErrorToSlack(this.apiConfigService.slack?.webhookUrl, e, {
        name: MonitoringService.AGENDA_SYNC_JOB_NAME,
        application: application.name,
      });
    }
  }

  private async createSummary(
    application: Application,
    summary: MetricSummary,
    latestSummary?: MetricSummary,
  ) {
    this.logger.log(`Creating summary for ${summary.applicationName}`);
    const allMetricsHealthy = !summary.metrics.find(
      (met) => !met.health?.isHealthy,
    );
    const allFatalMetricsHealthy = !summary.metrics
      .filter((met) => !met.metric.nonFatal)
      .find((met) => !met.health?.isHealthy);
    summary.health = {
      allMetricsHealthy,
      allFatalMetricsHealthy,
      numberOfMatrics: summary.metrics?.length || 0,
      numberOfHealthyMatrics:
        summary.metrics?.filter((met) => met.health?.isHealthy)?.length || 0,
    };
    summary.previousHealth = latestSummary?.health;
    summary.sameAllMetricsStatusSince = new Date();
    summary.sameFatalMetricsStatusSince = new Date();
    if (
      summary.health &&
      summary.health.allMetricsHealthy ===
        summary.previousHealth?.allMetricsHealthy &&
      latestSummary?.sameAllMetricsStatusSince
    ) {
      summary.sameAllMetricsStatusSince =
        latestSummary?.sameAllMetricsStatusSince;
    }
    if (
      summary.health &&
      summary.health.allFatalMetricsHealthy ===
        summary.previousHealth?.allFatalMetricsHealthy &&
      latestSummary?.sameFatalMetricsStatusSince
    ) {
      summary.sameFatalMetricsStatusSince =
        latestSummary?.sameFatalMetricsStatusSince;
    }

    summary.health.sameAllMetricsStatusSince =
      summary.sameAllMetricsStatusSince;
    summary.health.sameFatalMetricsStatusSince =
      summary.sameFatalMetricsStatusSince;
    const created = await this.summaryService.create(summary);
    this.logger.log(`Summary created for ${summary.applicationName}`);

    this.logger.log(`Updating application ${summary.applicationName}`);
    await this.applicationService.updateById(created.applicationId, {
      health: summary.health,
      previousHealth: summary.previousHealth,
    });

    this.logger.log(`Notifying ${summary.applicationName}`);
    await this.notifierService.notify(application, created, latestSummary);
  }

  private async processMetricHealth(
    application: Application,
    summary: MetricSummary,
    metric: Metric,
  ) {
    this.logger.log(
      `Processing metric ${metric.name} of service ${metric.service} of application ${application.name}`,
    );
    let health: Health = undefined;
    switch (metric.metricType) {
      case MetricType.Website: {
        health = await this.getWebsiteHealth(metric.metricUrl);
        break;
      }
      case MetricType.HealthApi: {
        health = await this.getHealthFromApi(metric);
        break;
      }
      default:
        break;
    }

    if (health) {
      const history = await this.updateHealth(application, metric, health);
      summary.metrics.push(history);
    }
  }

  private async updateHealth(
    application: Application,
    metric: Metric,
    health: Health,
  ) {
    let sameStatusSince = new Date();
    if (
      metric.health &&
      metric.health.isHealthy === health.isHealthy &&
      metric.sameStatusSince
    ) {
      sameStatusSince = metric.sameStatusSince;
    }
    if (health.isHealthy) {
      this.logger.log(
        `Application: ${application.name}, Service: ${
          metric.service
        }, Metric: ${metric.name}, Health: ${health.isHealthy ? 'Up' : 'Down'}`,
      );
    } else {
      this.logger.error(
        `Application: ${application.name}, Service: ${
          metric.service
        }, Metric: ${metric.name}, Health: ${health.isHealthy ? 'Up' : 'Down'}`,
      );
    }
    await this.metricService.updateById(metric._id, {
      health,
      sameStatusSince,
    });
    return this.historyService.create({
      applicationId: application._id,
      applicationName: application.name,
      metric,
      metricId: metric._id,
      health,
      previousHealth: metric.health,
      sameStatusSince,
    });
  }

  private async getWebsiteHealth(url: string): Promise<Health> {
    const start = new Date();
    try {
      const response = await promiseTimeout(60000, axios.get(url));
      const end = new Date();
      const responseDuration = (end.getTime() - start.getTime()) / 1000; // in seconds
      const isHealthy = response.status >= 200 && response.status < 300;
      return {
        isHealthy,
        responseDuration,
        error: isHealthy ? undefined : `Response status is ${response.status}`,
        errorType: isHealthy ? undefined : ErrorType.HttpError,
      };
    } catch (e) {
      const end = new Date();
      const responseDuration = (end.getTime() - start.getTime()) / 1000; // in seconds
      if (e instanceof TimeoutError) {
        return {
          isHealthy: false,
          responseDuration,
          error: e.message,
          errorType: ErrorType.Timeout,
        };
      }
      return {
        isHealthy: false,
        responseDuration,
        error: e.message,
        errorType: e?.response?.status ? ErrorType.HttpError : ErrorType.Error,
      };
    }
  }

  private async getHealthFromApi(metric: Metric): Promise<Health> {
    const start = new Date();
    try {
      const response = await promiseTimeout(60000, axios.get(metric.metricUrl));
      const end = new Date();
      const responseDuration = (end.getTime() - start.getTime()) / 1000; // in seconds
      const data = _.get(response.data, metric.responseField);
      const isHealthy = data === metric.healthyValue;
      return {
        isHealthy: data === metric.healthyValue,
        responseDuration,
        error: isHealthy
          ? undefined
          : `Expected ${metric.responseField || ''} value as ${
              metric.healthyValue
            }, got ${data}`,
        errorType: isHealthy ? undefined : ErrorType.HttpError,
      };
    } catch (e) {
      const end = new Date();
      const responseDuration = (end.getTime() - start.getTime()) / 1000; // in seconds
      if (e instanceof TimeoutError) {
        return {
          isHealthy: false,
          responseDuration,
          error: e.message,
          errorType: ErrorType.Timeout,
        };
      }
      return {
        isHealthy: false,
        responseDuration,
        error: e.message,
        errorType: e?.response?.status ? ErrorType.HttpError : ErrorType.Error,
      };
    }
  }
}
