import express from 'express';
import citiesValidation from '@server/validations/cities.validation';
import usersController from '@server/controllers/users.controller';

const router = express.Router();

router.route('/:slug').get(citiesValidation.getDetail, usersController.getUser);


export default router;
