import { Request } from 'express';
import { User } from '../user/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
}

export enum BountyStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

export enum AnswerStatus {
  PENDING = 'pending',
  WINNER = 'winner',
}
