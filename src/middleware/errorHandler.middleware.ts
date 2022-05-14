import apiResponse, { ErrorOptions } from '@server/utils/apiResponse';
import { AppResponse } from '@server/interfaces/ApiInterfaces';

export function errorHandler(err: ErrorOptions, _req: any, res: AppResponse<never>, next) {

  res.status(err.status).json(apiResponse.reject(err.message, err))
  next()
}
