import { validationMiddleware } from '@server/utils/validationMiddleware';

export default {
  users: [validationMiddleware],
  locations: [validationMiddleware],
};
