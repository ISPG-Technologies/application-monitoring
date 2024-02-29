import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

export * from './interfaces';
export * from './local.strategy';
export * from './jwt.strategy';
export * from './jwt-auth.guard';

export const strategies = [LocalStrategy, JwtStrategy];
