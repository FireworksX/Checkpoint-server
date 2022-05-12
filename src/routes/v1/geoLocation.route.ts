import express from 'express';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import geoLocationValidation from '@server/validations/geoLocation.validation';
import geoLocationController from '@server/controllers/geoLocation.controller';

const router = express.Router();

router
  .route('/getLocationByIp')
  .get(...geoLocationValidation.getLocationByIp, validationMiddleware, geoLocationController.getLocationByIp);

export default router;
