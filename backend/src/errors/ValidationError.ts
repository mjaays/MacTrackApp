import { AppError } from './AppError';

export interface ValidationDetail {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: ValidationDetail[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export default ValidationError;
