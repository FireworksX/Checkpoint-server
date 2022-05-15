import express from 'express';
import categoriesValidation from '@server/validations/categories.validation';
import categoriesController from '@server/controllers/categories.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/:slug').get(categoriesValidation.getDetail, categoriesController.getDetail);

router.route('/create').post(authorize(['admin']), categoriesValidation.create, categoriesController.create);
router.route('/update').post(authorize(['admin']), categoriesValidation.update, categoriesController.update);

export default router;
