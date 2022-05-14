import { Response } from 'express'
import { ErrorOptions } from '@server/utils/apiResponse';

export type ApiResponseBody<T> = {
  success: boolean
  data?: T
  message?: string
  error?: ErrorOptions
}

export type AppResponse<T> = Response<ApiResponseBody<T>>
