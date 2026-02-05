import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator';

export const authController = {
  async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      responseUtil.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async refresh(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await authService.refreshTokens(req.body.refreshToken);
      responseUtil.success(res, tokens);
    } catch (error) {
      next(error);
    }
  },

  async logout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      await authService.logout(req.userId!, refreshToken);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
