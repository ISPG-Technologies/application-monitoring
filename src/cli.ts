import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from './server/app.module';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadConfig, validateConfig } from './server/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaModule } from 'nestjs-agenda';
import { entities } from './server/entities';
import { controllers, services } from './server/module';
import { commands } from './server/commands';
import { strategies } from './server/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [loadConfig],
      cache: true,
      validate: validateConfig,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({ store: 'memory' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URL'),
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        family: 4, // Use IPv4, skip trying IPv6
        useUnifiedTopology: true, // use the MongoDB driver's new connection management engine
        poolSize: 10,
      }),
      inject: [ConfigService],
    }),
    AgendaModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        db: {
          address: configService.get('MONGODB_URL'),
          collection: 'agenda',
          options: { useUnifiedTopology: true },
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(entities),
    CommandModule,
  ],
  controllers,
  providers: [...services, ...commands, ...strategies],
})
export class CLIModule {}

(async () => {
  const app = await NestFactory.createApplicationContext(CLIModule);
  app.select(CommandModule).get(CommandService).exec();
})();
