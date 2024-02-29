import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AgendaConfig,
  CacheConfig,
  Environment,
  MongoDbConfig,
  LogConfig,
  MiddlewaresConfig,
  SlackLogConfig,
  JwtConfig,
  SendGridConfig,
} from './interfaces';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get cache(): CacheConfig {
    return this.configService.get<CacheConfig>('cache');
  }

  get mongodb(): MongoDbConfig {
    return this.configService.get<MongoDbConfig>('mongodb');
  }

  get agenda(): AgendaConfig {
    return this.configService.get<AgendaConfig>('agenda');
  }

  get serverTimezone(): string {
    return this.configService.get<string>('serverTimezone') || 'Asia/Dubai';
  }

  get debug(): boolean {
    return this.configService.get<boolean>('debug');
  }

  get env(): Environment {
    return this.configService.get<Environment>('env');
  }

  get logs(): LogConfig {
    return this.configService.get<LogConfig>('logs');
  }

  get slack(): SlackLogConfig {
    return this.configService.get<SlackLogConfig>('slack');
  }

  get middlewares(): MiddlewaresConfig {
    return this.configService.get<MiddlewaresConfig>('middlewares');
  }

  get jwt(): JwtConfig {
    return this.configService.get<JwtConfig>('jwt');
  }

  get sendgrid(): SendGridConfig {
    return this.configService.get<SendGridConfig>('sendgrid');
  }
}
