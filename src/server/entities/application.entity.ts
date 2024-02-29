import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

@Schema()
export class ApplicationHealth {
  @Prop()
  allMetricsHealthy?: boolean;

  @Prop()
  allFatalMetricsHealthy?: boolean;

  @Prop()
  numberOfMatrics: number;

  @Prop()
  numberOfHealthyMatrics: number;

  @Prop()
  sameAllMetricsStatusSince?: Date;

  @Prop()
  sameFatalMetricsStatusSince?: Date;
}

export const ApplicationHealthSchema =
  SchemaFactory.createForClass(ApplicationHealth);

@Schema()
export class Application {
  @Exclude()
  _id?: Types.ObjectId;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Prop()
  name: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Prop()
  title: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @Prop()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Prop()
  isActive?: true;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Prop()
  emailEnabled?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Prop()
  smsEnabled?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @Prop()
  notifyEmails?: string[];

  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @Prop()
  notifyCCEmails?: string[];

  @Exclude()
  @Prop({ type: ApplicationHealthSchema })
  health?: ApplicationHealth;

  @Exclude()
  @Prop({ type: ApplicationHealthSchema })
  previousHealth?: ApplicationHealth;

  @Prop()
  numberOfMetrics?: number;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.set('timestamps', true);
ApplicationSchema.index({ createdAt: -1, updatedAt: -1 });
ApplicationSchema.index({ name: 1, title: 1 });
