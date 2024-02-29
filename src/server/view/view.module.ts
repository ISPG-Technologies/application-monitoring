import { Module } from '@nestjs/common';
import { ApiConfigService, loadConfig, validateConfig } from '../config';
import { ConfigModule } from '@nestjs/config';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadConfig],
      cache: true,
      validate: validateConfig,
    }),
  ],
  providers: [ApiConfigService, ViewService],
  controllers: [ViewController],
})
export class ViewModule {}
