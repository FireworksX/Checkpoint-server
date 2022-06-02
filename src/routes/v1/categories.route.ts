import express from 'express';
import categoriesValidation from '@server/validations/categories.validation';
import categoriesController from '@server/controllers/categories.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:slug').get(categoriesValidation.getDetail, categoriesController.getDetail);
router.route('/list').get(categoriesValidation.getList, categoriesController.getList);

router.route('/create').post(authorize(), categoriesValidation.create, categoriesController.create);
router.route('/update').post(authorize(), categoriesValidation.update, categoriesController.update);

export default router;
