import { MetricHistory, MetricHistorySchema } from './metric-history.entity';
import { Metric, MetricSchema } from './metric.entity';
import { AppSettings, AppSettingsSchema } from './app-settings.entity';
import { MetricSummary, MetricSummarySchema } from './summary.entity';
import { User, UserSchema } from './user.entity';
import { AuthUser, AuthUserSchema } from './auth-user.entity';
import { SMSRequests, SMSRequestsSchema } from './sms-requests.entity';
import { EmailRequests, EmailRequestsSchema } from './email-requests.entity';
import { Application, ApplicationSchema } from './application.entity';

export * from './metric.entity';
export * from './metric-history.entity';
export * from './app-settings.entity';
export * from './summary.entity';
export * from './user.entity';
export * from './auth-user.entity';
export * from './sms-requests.entity';
export * from './email-requests.entity';
export * from './application.entity';

export const entities = [
  {
    name: Metric.name,
    schema: MetricSchema,
  },
  {
    name: MetricHistory.name,
    schema: MetricHistorySchema,
  },
  {
    name: AppSettings.name,
    schema: AppSettingsSchema,
  },
  {
    name: MetricSummary.name,
    schema: MetricSummarySchema,
  },
  {
    name: User.name,
    schema: UserSchema,
  },
  {
    name: AuthUser.name,
    schema: AuthUserSchema,
  },
  {
    name: SMSRequests.name,
    schema: SMSRequestsSchema,
  },
  {
    name: EmailRequests.name,
    schema: EmailRequestsSchema,
  },
  {
    name: Application.name,
    schema: ApplicationSchema,
  },
];
