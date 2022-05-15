import express from 'express';
import categoriesFieldsValidation from '@server/validations/categoriesFields.validation';
import categoriesFieldsController from '@server/controllers/categoriesFields.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/:slug').get(categoriesFieldsValidation.getDetail, categoriesFieldsController.getDetail);

router
  .route('/create')
  .post(authorize(['admin']), categoriesFieldsValidation.create, categoriesFieldsController.create);

export default router;
