import { CacheService } from '../cache';
import { ApiConfigService } from '../config';
import { AppSettingsService } from '../services/app-settings.service';
import { AuthService } from '../services/auth.service';
import { MonitoringService } from '../services/monitoring.service';
import { HistoryService } from '../services/history.service';
import { MetricService } from '../services/metric.service';
import { SummaryService } from '../services/summary.service';
import { UserService } from '../services/user.service';
import { NotifierService } from '../services/notifier.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { ApplicationService } from '../services/application.service';
import { CleanUpService } from '../services/clean-up.service';

export const services = [
  ApiConfigService,
  CacheService,
  MetricService,
  HistoryService,
  MonitoringService,
  AppSettingsService,
  SummaryService,
  AuthService,
  UserService,
  NotifierService,
  EmailService,
  SmsService,
  ApplicationService,
  CleanUpService,
];
