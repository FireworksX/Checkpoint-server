import { body } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';
import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  register: [body('phone').custom(phoneValidator), validationMiddleware],
  phoneValidation: [body('phone').custom(phoneValidator), validationMiddleware],
  login: [body('phone').custom(phoneValidator), body('code').exists(), validationMiddleware],
};
