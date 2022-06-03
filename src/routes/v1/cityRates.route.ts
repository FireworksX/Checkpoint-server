import express from 'express';
import cityRatesValidation from '@server/validations/cityRates.validation';
import cityRatesController from '@server/controllers/cityRates.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:slug').get(cityRatesValidation.getDetail, cityRatesController.getDetail);
router.route('/list').get(cityRatesController.getList);

router.route('/delete').post(authorize(['admin']), cityRatesValidation.delete, cityRatesController.delete);
router.route('/create').post(authorize(['admin']), cityRatesValidation.create, cityRatesController.create);
router.route('/update').post(authorize(['admin']), cityRatesValidation.update, cityRatesController.update);

export default router;
