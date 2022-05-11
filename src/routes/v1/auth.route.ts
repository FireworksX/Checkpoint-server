import express from 'express';
import authValidation from '@server/validations/auth.validation';
import authController from '@server/controllers/auth.controller';
import { validationMiddleware } from '@server/utils/validationMiddleware';

const router = express.Router();

router
  .route('/register')
  .post(...authValidation.register, validationMiddleware, authController.register);

router
  .route('/phoneValidation')
  .post(...authValidation.phoneValidation, validationMiddleware, authController.phoneValidation);

router
  .route('/login')
  .post(...authValidation.login, validationMiddleware, authController.login);

export default router;
