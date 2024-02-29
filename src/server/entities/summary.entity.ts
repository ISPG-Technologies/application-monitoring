import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  Application,
  ApplicationHealth,
  ApplicationHealthSchema,
} from './application.entity';
import { MetricHistory, MetricHistorySchema } from './metric-history.entity';

@Schema()
export class MetricSummary {
  _id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: Application.name })
  applicationId: Types.ObjectId;

  @Prop()
  applicationName: string;

  @Prop({ type: [MetricHistorySchema] })
  metrics: MetricHistory[];

  @Prop()
  notified?: boolean;

  @Prop({ type: ApplicationHealthSchema })
  health?: ApplicationHealth;

  @Prop({ type: ApplicationHealthSchema })
  previousHealth?: ApplicationHealth;

  @Prop()
  sameAllMetricsStatusSince?: Date;

  @Prop()
  sameFatalMetricsStatusSince?: Date;
}

export const MetricSummarySchema = SchemaFactory.createForClass(MetricSummary);

MetricSummarySchema.set('timestamps', true);

MetricSummarySchema.index({ createdAt: -1, updatedAt: -1 });
