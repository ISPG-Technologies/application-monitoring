import { Request } from 'express';
import { User } from '../entities';

export interface AuthRequest extends Request {
  user: User;
}
