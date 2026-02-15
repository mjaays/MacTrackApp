import { Response, NextFunction } from 'express';
import { jwtUtil } from '../utils/jwt.util';
import { AuthError } from '../errors/AuthError';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = jwtUtil.verifyAccessToken(token);

    req.userId = payload.userId;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      next(error);
    } else {
      next(new AuthError('Invalid or expired token'));
    }
  }
};

export default authMiddleware;
