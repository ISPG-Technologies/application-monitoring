import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { MetricBaseSchema } from './metric.entity';
import { Health, HealthSchema } from './health.entiry';
import { MetricBase } from './metric.entity';
import { Application } from './application.entity';

@Schema()
export class MetricHistory {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: Application.name })
  applicationId: Types.ObjectId;

  @Prop()
  applicationName: string;

  @Prop({ type: Types.ObjectId })
  metricId: Types.ObjectId;

  @Prop({ type: MetricBaseSchema })
  metric: MetricBase;

  @Prop({ type: HealthSchema })
  health?: Health;

  @Prop({ type: HealthSchema })
  previousHealth?: Health;

  @Prop()
  sameStatusSince?: Date;
}

export const MetricHistorySchema = SchemaFactory.createForClass(MetricHistory);

MetricHistorySchema.set('timestamps', true);

MetricHistorySchema.index({ metricId: 1 });
MetricHistorySchema.index({ createdAt: -1, updatedAt: -1 });
