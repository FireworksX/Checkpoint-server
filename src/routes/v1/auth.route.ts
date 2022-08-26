import express from 'express';
import authValidation from '@server/validations/auth.validation';
import authController from '@server/controllers/auth.controller';

const router = express.Router();

router.route('/register').post(authValidation.register, authController.register);

router
  .route('/phoneValidation/create')
  .post(authValidation.phoneValidationCreate, authController.phoneValidationCreate);
router.route('/phoneValidation/check').get(authValidation.phoneValidationCheck, authController.phoneValidationCheck);

router.route('/mailValidation/create').post(authValidation.mailValidationCreate, authController.mailValidationCreate);
router.route('/mailValidation/check').get(authValidation.mailValidationCheck, authController.mailValidationCheck);

router.route('/login').post(authValidation.login, authController.login);

router.route('/refresh-token').post(authValidation.refreshToken, authController.refreshToken);

export default router;
