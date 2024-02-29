import * as cors from 'cors';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as compression from 'compression';
import { ApiConfigService } from '../config/api-config-service';

export const loadMiddlewares = (
  server: any,
  configService: ApiConfigService,
) => {
  const whiteListedDomains =
    configService.middlewares?.allowedDomains?.split(',');
  if (configService.debug) {
    console.log('whitelisted domains: %O', whiteListedDomains);
  }
  const corsOptions = {
    exposedHeaders: [
      'X-Total-Count',
      'X-Pending-Count',
      'X-Total-Amount',
      'X-Total-Refund',
      'X-Total-Card',
      'X-Total-Cash',
      'X-Total-Online',
      'X-Total-Amount-Received',
      'X-Total-Amount-Remaining',
    ],
    credentials: true,
    origin: whiteListedDomains,
  };
  server.use(cors(corsOptions));
  // // enable preflight across all routes
  server.options?.('*', cors(corsOptions));

  // help secure Express apps with various HTTP headers
  server.use(helmet({ contentSecurityPolicy: false }));

  // compress
  server.use(compression());

  // logs req. to console
  server.use(morgan('dev'));
};
