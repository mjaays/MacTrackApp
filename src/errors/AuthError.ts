import { AppError } from './AppError';

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 401, 'AUTH_ERROR', details);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: unknown) {
    super(message, 403, 'UNAUTHORIZED', details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export default AuthError;
