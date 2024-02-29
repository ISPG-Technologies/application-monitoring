import { Inject, Logger } from '@nestjs/common';
import { Job } from 'agenda';
import { addDays } from 'date-fns';
import { AgendaService } from 'nestjs-agenda';
import { HistoryService } from './history.service';
import { SummaryService } from './summary.service';

export class CleanUpService {
  static readonly AGENDA_CLEAN_UP_JOB_NAME = 'Clean Up Old Data';
  private logger = new Logger(CleanUpService.name);

  constructor(
    @Inject(AgendaService)
    private readonly agenda: AgendaService,
    private historyService: HistoryService,
    private summaryService: SummaryService,
  ) {
    this.agenda.define(
      CleanUpService.AGENDA_CLEAN_UP_JOB_NAME,
      {},
      this.cleanUpOldData.bind(this),
    );
    this.agenda.every(
      '0 0 * * *',
      CleanUpService.AGENDA_CLEAN_UP_JOB_NAME,
      {},
      { timezone: 'Asia/Calcutta' },
    );
  }

  async cleanUpOldData(job: Job, done: (error?: Error) => void) {
    const now = new Date();
    const oldDateToPurge = addDays(now, -14);
    this.logger.log(`Clearing old data before ${oldDateToPurge}`);
    this.logger.log(`Clearing old metric histories`);
    let deleted = await this.historyService.deleteMany({
      createdAt: { $lt: oldDateToPurge },
    });
    this.logger.log(`${deleted.deletedCount} items deleted`);

    this.logger.log('Clearing old metric summaries');
    deleted = await this.summaryService.deleteMany({
      createdAt: { $lt: oldDateToPurge },
    });
    this.logger.log(`${deleted.deletedCount} items deleted`);
    done();
  }
}
