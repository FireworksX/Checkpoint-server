import { body } from 'express-validator';
import { phoneValidator } from '@server/validations/phone.validator';

export default {
  registerPhone: [body('phone').custom(phoneValidator)],
  login: [body('phone').custom(phoneValidator)],
};
