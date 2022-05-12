import { param } from 'express-validator';

export default {
  getLocationByIp: [param('ip')],
};
