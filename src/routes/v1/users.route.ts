import express from 'express';
import usersValidation from '@server/validations/users.validation';
import usersController from '@server/controllers/users.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:username').get(authorize(), usersValidation.getUser, usersController.getUser);
router.route('/check').get(usersController.hasRegisterUser);

router.route('/profile').get(authorize(), usersController.loggedIn);
router.route('/profile/update').post(authorize(), usersController.update);
router.route('/profile/subscribe').post(authorize(), usersValidation.subscribe, usersController.subscribe);
router.route('/profile/unsubscribe').post(authorize(), usersValidation.subscribe, usersController.unsubscribe);
router
  .route('/profile/checkSubscribe')
  .get(authorize(), usersValidation.checkSubscribe, usersController.checkSubscribe);

export default router;
