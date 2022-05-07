import { ApiResponseBody } from '@server/interfaces/ApiInterfaces';
import httpStatus from 'http-status';

interface ErrorOptions {
  name?: Error['name'];
  message?: string;
  errors?: string[];
  status?: number;
  isPublic?: boolean;
  isOperational?: true; // This is required since bluebird 4 doesn't append it anymore.
  stack?: Error['stack'];
}

const DEFAULT_ERROR_OPTIONS: ErrorOptions = {
  name: 'Error',
  message: 'Internal Server Error',
  errors: [],
  status: httpStatus.INTERNAL_SERVER_ERROR,
  isPublic: true,
  isOperational: true,
  stack: undefined,
};

export default {
  resolve: <T>(data: T): ApiResponseBody<T> => {
    return {
      success: true,
      data,
    };
  },

  reject: <T>(message?: string): ApiResponseBody<T> => {
    return {
      success: true,
      message,
    };
  },

  error: (options: ErrorOptions) => {
    const proxyOptions = { ...DEFAULT_ERROR_OPTIONS, ...options };
    const ErrorType = new Error(proxyOptions.message);
    ErrorType.name = proxyOptions.name;

    return ErrorType
  },
};
