import { Inject, Injectable, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ApiConfigService } from '../config';

@Injectable()
export class CacheService {
  @Inject(CACHE_MANAGER) private cacheManager: Cache;
  @Inject()
  private readonly apiConfigService: ApiConfigService;

  async getCache<T>(
    key: string,
    options?: {
      fallback?: () => Promise<T>;
      timeoutInSeconds?: number;
      reload?: boolean;
    },
  ) {
    const cacheKey = this.getKey(key);
    const item: T = await this.cacheManager.get(cacheKey);
    if (!options?.reload) {
      if (item !== undefined && item !== null) {
        return item;
      }
    }

    if (!options?.fallback) {
      return item;
    }

    const fromFallback = await options?.fallback();
    if (fromFallback !== undefined && fromFallback !== null) {
      await this.cacheManager.set(cacheKey, fromFallback, {
        ttl: options?.timeoutInSeconds,
      });
    }

    return fromFallback;
  }

  async clearCache(key: string) {
    const cacheKey = this.getKey(key);
    await this.cacheManager.del(cacheKey);
  }

  async setValue(
    key: string,
    value: any,
    options?: {
      timeoutInSeconds?: number;
    },
  ) {
    const cacheKey = this.getKey(key);
    await this.cacheManager.set(cacheKey, value, {
      ttl: options?.timeoutInSeconds,
    });
  }

  private getKey(key: string) {
    return `${this.apiConfigService.cache?.namespace || ''}${key}`;
  }
}
