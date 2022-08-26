import { Response, Request } from 'express';
import { ParsedQs } from 'qs';
import { ErrorOptions } from '@server/utils/apiResponse';
import { MailService } from '@server/services/mailService';

export type ApiResponseBody<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorOptions;
};

type ResponseLocals = {
  mailer: MailService
}

export type AppResponse<T> = Response<ApiResponseBody<T>, ResponseLocals>;

export interface AppRequestBody<T> extends Request {
  body: T;
}
export interface AppRequestQuery<T extends ParsedQs> extends Request {
  query: T;
}
