import { ApiConfig, CacheConfig, Environment } from './interfaces';
export const loadConfig = (): ApiConfig => {
  const cache: CacheConfig = {
    namespace: process.env.CACHE_NAMESPACE,
  };
  const env: Environment =
    (process.env.NODE_ENV as Environment) || 'development';
  return {
    agenda: {
      url: process.env.AGENDA_MONGODB_URL,
      collectionName: process.env.AGENDA_COLLECTION_NAME,
    },
    cache,
    debug: env === 'development',
    env,
    jwt: { secret: process.env.JWT_SECRET },
    logs: {
      level: process.env.LOG_LEVEL || 'silly',
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
    },
    middlewares: {
      allowedDomains: process.env.ALLOWED_DOMAINS,
    },
    mongodb: {
      url: process.env.MONGODB_URL,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.FROM_EMAIL,
    },
  };
};
