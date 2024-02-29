import { Inject, Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { MetricType, Application } from '../entities';
import { ApplicationService } from '../services/application.service';
import { MetricService } from '../services/metric.service';
import { mergeUrl } from '../utils';

@Injectable()
export class LoadEdcMetricsCommand {
  @Inject() private readonly metricService: MetricService;
  @Inject() private readonly applicationService: ApplicationService;
  private logger = new Logger(LoadEdcMetricsCommand.name);

  private readonly constants = {
    apiBaseUrl: 'https://api.edc-dev.ispgnet.com/',
    customerAppUrl: 'https://app.edc-dev.ispgnet.com',
    adminAppUrl: 'https://admin.edc-dev.ispgnet.com',
    odooAppUrl: 'http://35.234.132.182:8068',
  };

  @Command({
    command: 'load:metrics:edc',
    describe: 'load metrics',
  })
  async load() {
    const application = await this.applicationService.createOrUpdate({
      name: 'Excellence Driving Staging',
      title: 'Excellence Driving Staging Application Monitoring',
      description:
        "Here's what's happening with the application/services today",
      isActive: true,
      emailEnabled: false,
      notifyEmails: ['romi.v@e-dc.com'],
    });
    // Analytics
    this.logger.log(`Creating metrics value for analytics service`);
    await this.createServiceMetrics(application, 'Analytics', {
      db: true,
      memory: true,
      disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
    });
    await this.createRpcMetric(application, 'Analytics', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'analytics',
    });

    // Schedule
    await this.createServiceMetrics(application, 'Schedule', {
      db: true,
      memory: true,
      disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/schedule/v1'),
    });

    await this.createRpcMetric(application, 'Schedule', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'schedule',
    });

    // Task Scheduler
    await this.createServiceMetrics(application, 'Task Scheduler', {
      db: true,
      memory: true,
      disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/task-scheduler/v1'),
    });

    await this.createRpcMetric(application, 'Task Scheduler', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'task-scheduler',
    });

    // Notification
    await this.createServiceMetrics(application, 'Notification', {
      db: true,
      memory: true,
      disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/notification/v1'),
    });

    await this.createRpcMetric(application, 'Notification', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'notification',
    });

    // Chatbot
    await this.createOldServiceMetrics(application, 'Chatbot', {
      db: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/chatbot/v1'),
    });

    await this.createRpcMetric(application, 'Chatbot', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'chatbot',
    });

    // Authentication
    await this.createRpcMetric(application, 'Authentication', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'authentication',
    });

    // Curriculum
    await this.createOldServiceMetrics(application, 'Curriculum', {
      db: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/curriculum/v1'),
    });

    await this.createRpcMetric(application, 'Curriculum', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'curriculum',
    });

    // Entity
    await this.createOldServiceMetrics(application, 'Entity', {
      db: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/entity/v1'),
    });

    await this.createRpcMetric(application, 'Entity', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'entity',
    });

    // Erp
    // await this.createOldServiceMetrics(application,'Erp', {
    //   db: true,
    //   baseUrl: mergeUrl(this.constants.apiBaseUrl, '/erp/v1'),
    // });

    await this.createRpcMetric(application, 'Erp', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'erp',
    });

    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service: 'Erp',
      metricUrl: this.constants.odooAppUrl,
      name: 'Odoo',
      metricType: MetricType.Website,
      isActive: true,
    });

    // Integrator
    await this.createOldServiceMetrics(application, 'Integrator', {
      db: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/integrator/v1'),
    });

    await this.createRpcMetric(application, 'Integrator', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'integrator',
    });

    // Payment
    await this.createOldServiceMetrics(application, 'Payment', {
      db: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/payment/v1'),
    });

    await this.createRpcMetric(application, 'Payment', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'payment',
    });

    // Pricing
    await this.createOldServiceMetrics(application, 'Pricing', {
      db: true,
      // memory: true,
      // disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/pricing/v1'),
    });

    await this.createRpcMetric(application, 'Pricing', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'pricing',
    });

    // Upload
    await this.createOldServiceMetrics(application, 'Upload', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/upload/v1'),
    });

    await this.createRpcMetric(application, 'Upload', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'upload',
    });

    // User
    await this.createOldServiceMetrics(application, 'User', {
      db: true,
      // memory: true,
      // disk: true,
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/user/v1'),
    });

    await this.createRpcMetric(application, 'User', {
      baseUrl: mergeUrl(this.constants.apiBaseUrl, '/analytics/v1'),
      service: 'user',
    });

    // Websites
    this.logger.log(`Creating metrics value for websites`);
    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service: 'Websites',
      metricUrl: this.constants.customerAppUrl,
      name: 'Customer',
      metricType: MetricType.Website,
      isActive: true,
    });

    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service: 'Websites',
      metricUrl: this.constants.adminAppUrl,
      name: 'Admin',
      metricType: MetricType.Website,
      isActive: true,
    });

    // Integrations
    this.logger.log(`Creating metrics value for integrations`);

    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service: 'Infra',
      metricUrl: mergeUrl(
        this.constants.apiBaseUrl,
        '/analytics/v1/health/rabbitmq',
      ),
      name: 'Rabbit-MQ',
      metricType: MetricType.HealthApi,
      responseField: 'status',
      healthyValue: 'up',
      isActive: true,
    });
    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service: 'Infra',
      metricUrl: mergeUrl(
        this.constants.apiBaseUrl,
        '/analytics/v1/health/redis',
      ),
      name: 'Redis',
      metricType: MetricType.HealthApi,
      responseField: 'status',
      healthyValue: 'up',
      isActive: true,
    });

    process.exit(0);
  }

  async createServiceMetrics(
    application: Application,
    service: string,
    options: {
      db?: boolean;
      memory?: boolean;
      baseUrl: string;
      disk?: boolean;
    },
  ) {
    this.logger.log('Creating Microservice Metric');
    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service,
      name: 'Microservice',
      metricUrl: mergeUrl(options.baseUrl, '/health'),
      metricType: MetricType.HealthApi,
      responseField: 'status',
      healthyValue: 'up',
      isActive: true,
    });

    if (options.db) {
      this.logger.log('Creating DB Metric');
      await this.metricService.createOrUpdate({
        applicationId: application._id,
        service,
        name: 'Database',
        metricUrl: mergeUrl(options.baseUrl, '/health/db'),
        metricType: MetricType.HealthApi,
        responseField: 'status',
        healthyValue: 'up',
        isActive: true,
      });
    }
    if (options.memory) {
      this.logger.log('Creating Memory Metric');
      await this.metricService.createOrUpdate({
        applicationId: application._id,
        service,
        name: 'Memory',
        metricUrl: mergeUrl(options.baseUrl, '/health/memory'),
        metricType: MetricType.HealthApi,
        responseField: 'status',
        healthyValue: 'up',
        isActive: true,
        nonFatal: true,
      });
    }
    if (options.disk) {
      this.logger.log('Creating Disk Metric');
      await this.metricService.createOrUpdate({
        applicationId: application._id,
        service,
        name: 'Disk',
        metricUrl: mergeUrl(options.baseUrl, '/health/disk'),
        metricType: MetricType.HealthApi,
        responseField: 'status',
        healthyValue: 'up',
        isActive: true,
        nonFatal: true,
      });
    }
  }

  async createOldServiceMetrics(
    application: Application,
    service: string,
    options: {
      db?: boolean;
      baseUrl: string;
    },
  ) {
    this.logger.log('Creating Microservice Metric');
    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service,
      name: 'Microservice',
      metricUrl: mergeUrl(options.baseUrl, '/api/health'),
      metricType: MetricType.HealthApi,
      responseField: 'state',
      healthyValue: 'up',
      isActive: true,
    });
    if (options.db) {
      this.logger.log('Creating DB Metric');
      await this.metricService.createOrUpdate({
        applicationId: application._id,
        service,
        name: 'Database',
        metricUrl: mergeUrl(options.baseUrl, '/api/health'),
        metricType: MetricType.HealthApi,
        responseField: 'dbState',
        healthyValue: 'connected',
        isActive: true,
      });
    }
  }
  async createRpcMetric(
    application: Application,
    service: string,
    options: {
      baseUrl: string;
      service: string;
    },
  ) {
    this.logger.log('Creating RPC Metric');
    await this.metricService.createOrUpdate({
      applicationId: application._id,
      service,
      name: 'RPC',
      metricUrl: mergeUrl(
        options.baseUrl,
        `/health/rpc?service=${options.service}`,
      ),
      metricType: MetricType.HealthApi,
      responseField: 'status',
      healthyValue: 'up',
      isActive: true,
    });
  }
}
