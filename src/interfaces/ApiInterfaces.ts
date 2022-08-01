import { Response, Request } from 'express';
import { ParsedQs } from 'qs';
import { ErrorOptions } from '@server/utils/apiResponse';

export type ApiResponseBody<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorOptions;
};

export type AppResponse<T> = Response<ApiResponseBody<T>>;

export interface AppRequestBody<T> extends Request {
  body: T;
}
export interface AppRequestQuery<T extends ParsedQs> extends Request {
  query: T;
}
