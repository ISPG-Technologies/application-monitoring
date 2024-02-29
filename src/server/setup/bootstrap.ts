import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ApiConfigService } from '../config/api-config-service';
import { loadMiddlewares } from './middlewares';

export const bootstrapServer = (app: INestApplication) => {
  const apiConfigService = app.get(ApiConfigService);
  loadMiddlewares(app, apiConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: { target: false, value: false },
      validateCustomDecorators: true,
    }),
  );
};
