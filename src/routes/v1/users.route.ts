import express from 'express';
import usersValidation from '@server/validations/users.validation';
import usersController from '@server/controllers/users.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:username').get(authorize(), usersValidation.getUser, usersController.getUser);
router.route('/check').get(usersController.hasRegisterUser);

router.route('/profile').get(authorize(), usersController.loggedIn);

export default router;
