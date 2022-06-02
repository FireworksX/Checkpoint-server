import { body, query } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  register: [body('phone').custom(phoneValidator), validationMiddleware],
  phoneValidationCreate: [body('phone').custom(phoneValidator), validationMiddleware],
  phoneValidationCheck: [
    query('phone').custom(phoneValidator),
    query('code').exists().isString(),
    validationMiddleware,
  ],
  login: [body('phone').custom(phoneValidator), body('code').exists().isString(), validationMiddleware],
  refreshToken: [body('phone').custom(phoneValidator), body('refreshToken').exists().isJWT(), validationMiddleware],
};
