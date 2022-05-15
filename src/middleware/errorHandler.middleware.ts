import apiResponse, { ErrorOptions } from '@server/utils/apiResponse';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import httpStatus from 'http-status';

export function errorHandler(error: ErrorOptions | any, _req: any, res: AppResponse<never>, next) {
  let resultError = error

  if (error.code === 11000) {
    resultError = apiResponse.error({
      message: 'Validation Error',
      status: httpStatus.CONFLICT,
      isPublic: true,
      stack: error.stack,
    })
  }

  res.status(resultError.status).json(apiResponse.reject(resultError.message, resultError))
  next()
}
