import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { enumToStringArray } from '../utils';

export enum AppSettingsKey {
  // general
  GENERAL_SETTINGS = 'GENERAL_SETTINGS',

  // SMS
  SMS_SETTINGS = 'SMS_SETTINGS',

  // Email
  EMAIL_SETTINGS = 'EMAIL_SETTINGS',
}

@Schema()
export class AppSettings {
  @Prop({
    type: String,
    enum: enumToStringArray(AppSettingsKey),
    required: true,
    unique: true,
  })
  key: AppSettingsKey;

  @Prop({ type: MongooseSchema.Types.Mixed })
  value: any;

  @Prop()
  isActive: boolean;
}

export const AppSettingsSchema = SchemaFactory.createForClass(AppSettings);
