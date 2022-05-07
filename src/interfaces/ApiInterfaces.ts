import { Response } from 'express'

export type ApiResponseBody<T> = {
  success: boolean
  data?: T
  message?: string
}

export type AppResponse<T> = Response<ApiResponseBody<T>>
