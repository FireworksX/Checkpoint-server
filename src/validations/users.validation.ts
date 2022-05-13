import { param } from 'express-validator';

export default {
  getUser: [param('username').isString()],
};
