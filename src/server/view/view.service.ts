import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import createServer from 'next';
import { NextServer } from 'next/dist/server/next';
import { Request, Response } from 'express';
import { ApiConfigService } from '../config';

@Injectable()
export class ViewService implements OnModuleInit {
  private server: NextServer;
  private logger = new Logger(ViewService.name);

  constructor(private apiConfigService: ApiConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      this.server = createServer({
        dev: this.apiConfigService.debug,
        dir: './src/client',
        conf: {
          distDir: '../../.next',
        },
      });
      await this.server.prepare();
    } catch (error) {
      this.logger.error(error);
    }
  }

  handler(req: Request, res: Response) {
    return this.server.getRequestHandler()(req, res);
  }
}
