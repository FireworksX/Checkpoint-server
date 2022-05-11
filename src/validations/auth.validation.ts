import { body } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';

export default {
  register: [body('phone').custom(phoneValidator)],
  phoneValidation: [body('phone').custom(phoneValidator)],
  login: [body('phone').custom(phoneValidator), body('password')],
};
