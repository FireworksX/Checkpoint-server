import express from 'express';
import authValidation from '@server/validations/auth.validation';
import authController from '@server/controllers/auth.controller';

const router = express.Router();

router.route('/register').post(authValidation.register, authController.register);

router.route('/phoneValidation').post(authValidation.phoneValidation, authController.phoneValidation);

router.route('/login').post(authValidation.login, authController.login);

export default router;
