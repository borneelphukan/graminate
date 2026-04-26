import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    isAdmin?: boolean;
    adminId?: string;
    userId?: number;
  };
}
