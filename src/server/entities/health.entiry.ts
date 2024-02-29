import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { enumToStringArray } from '../utils';

export enum ErrorType {
  Timeout = 'timeout',
  HealthyValueMissmatch = 'healthy-value-missmatch',
  HttpError = 'HttpError',
  Error = 'Error',
}

@Schema({ _id: false })
export class Health {
  createdAt?: Date;
  updatedAt?: Date;

  @Prop()
  isHealthy?: boolean;

  @Prop()
  responseDuration?: number;

  @Prop()
  error?: string;

  @Prop({ type: String, enum: enumToStringArray(ErrorType) })
  errorType?: ErrorType;
}

export const HealthSchema = SchemaFactory.createForClass(Health);

HealthSchema.set('timestamps', true);

HealthSchema.index({ createdAt: -1, updatedAt: -1 });

HealthSchema.index({
  isHealthy: 1,
  error: 1,
  isTimeout: 1,
  previousHealth: 1,
});
HealthSchema.index({ responseDuration: -1 });
