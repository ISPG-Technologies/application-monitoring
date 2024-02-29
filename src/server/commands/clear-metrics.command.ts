import { Inject, Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { HistoryService } from '../services/history.service';
import { MetricService } from '../services/metric.service';
import { SummaryService } from '../services/summary.service';

@Injectable()
export class ClearMetricsCommand {
  @Inject() private readonly metricService: MetricService;
  @Inject() private readonly metricHistoryService: HistoryService;
  @Inject() private readonly metricSummaryService: SummaryService;
  private logger = new Logger(ClearMetricsCommand.name);

  @Command({
    command: 'clear:metrics',
    describe: 'clear metrics',
  })
  async clear() {
    // Analytics
    this.logger.log(`Clearing metrics`);
    await this.metricService.deleteMany({});

    this.logger.log(`Clearing metric history`);
    await this.metricHistoryService.deleteMany({});

    this.logger.log(`Clearing metric summary`);
    await this.metricSummaryService.deleteMany({});

    process.exit(0);
  }
}
