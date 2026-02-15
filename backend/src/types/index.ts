export * from './enums';

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface DateRangeParams {
  startDate: Date;
  endDate: Date;
}
