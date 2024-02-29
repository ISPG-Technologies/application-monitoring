import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class AuthUser {
  @Prop(
    raw({
      type: Types.ObjectId,
      unique: true,
    }),
  )
  userId: Types.ObjectId;

  @Prop()
  hashedPassword?: string;
}

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);

AuthUserSchema.set('timestamps', true);

AuthUserSchema.index({ createdAt: -1, updatedAt: -1 });
AuthUserSchema.index({ userId: 1 });
