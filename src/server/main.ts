import { ApiConfigService } from './config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { bootstrapServer, GlobalExceptionsFilter } from './setup';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  bootstrapServer(app);

  app.setGlobalPrefix('/');
  app.useGlobalFilters(
    new GlobalExceptionsFilter(app.get(ApiConfigService), (res, code, data) =>
      res.status(code).json(data),
    ),
  );

  const options = new DocumentBuilder()
    .setTitle('ISPG Montior V1 Api')
    .setDescription('The ISPG Montior API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  const host = '0.0.0.0';
  const port = process.env.PORT || 8000;
  await app.listen(port, host);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
