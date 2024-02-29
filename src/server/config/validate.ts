import { plainToClass } from 'class-transformer';
import { IsDefined, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsDefined()
  @IsString()
  MONGODB_URL: string;

  @IsDefined()
  @IsString()
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  SENDGRID_KEY: string;

  @IsOptional()
  @IsString()
  FROM_EMAIL: string;

  @IsOptional()
  @IsString()
  ALLOWED_DOMAINS: string;
}

export const validateConfig = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
