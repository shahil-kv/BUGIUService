import { errorHandler } from '../middleware/error.middleware';
/**
 * @description Common Error class to throw an error from anywhere.
 * The {@link errorHandler} middleware will catch this error at the central place and it will return an appropriate response to the client
 */
class ApiError extends Error {
  message: string;
  statusCode: number;
  data: any[] = [];
  success: boolean;
  errors: any[];
  constructor(statusCode: number, message: string = 'Something went wrong', errors: any[] = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = [];
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
