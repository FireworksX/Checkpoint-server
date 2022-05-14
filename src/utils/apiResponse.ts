import { ApiResponseBody } from '@server/interfaces/ApiInterfaces';
import httpStatus from 'http-status';

export interface ErrorOptions {
  isError: boolean;
  name?: Error['name'];
  message?: string;
  errors?: { field: string; location: string; messages: string | string[] }[];
  status?: number;
  isPublic?: boolean;
  isOperational?: true; // This is required since bluebird 4 doesn't append it anymore.
  stack?: Error['stack'];
}

const DEFAULT_ERROR_OPTIONS: ErrorOptions = {
  isError: true,
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

  reject: <T>(message?: string, error?: ErrorOptions): ApiResponseBody<T> => {
    return {
      success: false,
      message,
      error,
    };
  },

  error: (options: Omit<ErrorOptions, 'isError'>) => {
    return { ...DEFAULT_ERROR_OPTIONS, ...options };
  },
};
