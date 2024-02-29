import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Application } from './application.entity';
import { Health, HealthSchema } from './health.entiry';

export enum MetricType {
  Website = 'website',
  HealthApi = 'health-api',
}

@Schema()
export class MetricBase {
  _id?: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  service: string;

  @Prop()
  metricUrl: string;

  @Prop()
  metricType?: MetricType;

  @Prop()
  responseField?: string;

  @Prop()
  healthyValue?: string;

  @Prop()
  healthyDelay?: number;

  @Prop()
  nonFatal?: boolean;
}

export const MetricBaseSchema = SchemaFactory.createForClass(MetricBase);

@Schema()
export class Metric extends MetricBase {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ type: HealthSchema })
  health?: Health;

  @Prop()
  isActive?: boolean;

  @Prop()
  sameStatusSince?: Date;

  @Prop({ type: Types.ObjectId, ref: Application.name })
  applicationId: Types.ObjectId;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);

MetricSchema.set('timestamps', true);

MetricSchema.index({
  name: 1,
  application: 1,
  metricType: 1,
});
MetricSchema.index({ createdAt: -1 });
