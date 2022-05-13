import express from 'express'
import usersValidation from '@server/validations/users.validation';
import { validationMiddleware } from '@server/utils/validationMiddleware';
import usersController from '@server/controllers/users.controller';

const router = express.Router()

router.route('/:username').get(...usersValidation.getUser, validationMiddleware, usersController.getUser)

export default router
