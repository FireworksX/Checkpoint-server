import express from 'express';
import usersValidation from '@server/validations/users.validation';
import usersController from '@server/controllers/users.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/:username').get(authorize(), usersValidation.getUser, usersController.getUser);

export default router;
