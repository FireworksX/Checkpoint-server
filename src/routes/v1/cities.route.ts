import express from 'express';
import citiesValidation from '@server/validations/cities.validation';
import citiesController from '@server/controllers/cities.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:slug').get(citiesValidation.getDetail, citiesController.getDetail);
router.route('/list').get(citiesController.getList);

router.route('/delete').post(authorize(['admin']), citiesValidation.delete, citiesController.delete);
router.route('/create').post(authorize(['admin']), citiesValidation.create, citiesController.create);
router.route('/update').post(authorize(['admin']), citiesValidation.update, citiesController.update);



export default router;
