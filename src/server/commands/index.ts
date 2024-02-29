import { LoadAppSettingsCommand } from './app-settings.command';
import { ClearMetricsCommand } from './clear-metrics.command';
import { CreateSuperUserCommand } from './superuser.command';
import { TestSendMailCommand } from './test-send-mail.command';

export const commands = [
  LoadAppSettingsCommand,
  CreateSuperUserCommand,
  ClearMetricsCommand,
  TestSendMailCommand,
];
