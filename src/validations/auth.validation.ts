import { body, query } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import { countryValidator } from '@server/validations/country.validator';

export default {
  register: [body('mail').isEmail(), validationMiddleware],
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
  mailValidationCreate: [body('mail').isEmail(), validationMiddleware],
  mailValidationCheck: [query('mail').isEmail(), query('code').exists().isString(), validationMiddleware],
  login: [
    body('mail').isEmail(),
    body('code').exists().isString(),
    validationMiddleware,
  ],
  refreshToken: [
    body('mail').isEmail(),
    body('refreshToken').exists().isJWT(),
    validationMiddleware,
  ],
};
