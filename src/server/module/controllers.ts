import { AppSettingsController } from '../controllers/app-settings.controller';
import { ApplicationController } from '../controllers/application.controller';
import { AuthController } from '../controllers/auth.controller';
import { HistoryController } from '../controllers/history.controller';
import { MetricController } from '../controllers/metric.controller';
import { TasksController } from '../controllers/tasks.controller';

export const controllers = [
  AppSettingsController,
  MetricController,
  HistoryController,
  TasksController,
  AuthController,
  ApplicationController,
];
