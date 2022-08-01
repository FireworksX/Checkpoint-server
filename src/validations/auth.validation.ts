import { body, query } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { countryValidator } from '@server/validations/country.validator';

export default {
  register: [body('phone').custom(phoneValidator), body('country').custom(countryValidator), validationMiddleware],
  phoneValidationCreate: [
    body('phone').custom(phoneValidator),
    body('country').custom(countryValidator),
    validationMiddleware,
  ],
  phoneValidationCheck: [
    query('phone').custom(phoneValidator),
    query('country').custom(countryValidator),
    query('code').exists().isString(),
    validationMiddleware,
  ],
  login: [body('phone').custom(phoneValidator), body('country').custom(countryValidator), body('code').exists().isString(), validationMiddleware],
  refreshToken: [body('phone').custom(phoneValidator), body('country').custom(countryValidator), body('refreshToken').exists().isJWT(), validationMiddleware],
};
