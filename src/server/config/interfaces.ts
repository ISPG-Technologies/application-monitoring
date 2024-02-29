export interface MiddlewaresConfig {
  allowedDomains?: string;
}

export interface MongoDbConfig {
  url: string;
}

export interface AgendaConfig {
  url: string;
  collectionName: string;
}

export interface LogConfig {
  level: string;
}

export interface SlackLogConfig {
  webhookUrl?: string;
}

export interface CacheConfig {
  namespace?: string;
}

export interface JwtConfig {
  secret: string;
}

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
}

export type Environment = 'development' | 'test' | 'production';

export interface ApiConfig {
  middlewares: MiddlewaresConfig;
  mongodb: MongoDbConfig;
  agenda: AgendaConfig;
  logs: LogConfig;
  slack: SlackLogConfig;
  debug?: boolean;
  env: Environment;
  cache?: CacheConfig;
  jwt?: JwtConfig;
  sendgrid?: SendGridConfig;
}
