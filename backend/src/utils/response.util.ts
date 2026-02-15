import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const responseUtil = {
  success<T>(res: Response, data: T, statusCode = 200, meta?: ApiResponse['meta']): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return res.status(statusCode).json(response);
  },

  created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  },

  noContent(res: Response): Response {
    return res.status(204).send();
  },

  error(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: unknown
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
    return res.status(statusCode).json(response);
  },

  paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    return this.success(res, data, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
};

export default responseUtil;
