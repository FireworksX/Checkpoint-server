import express from 'express';
import locationsValidation from '@server/validations/locations.validation';
import locationsController from '@server/controllers/locations.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/detail/:slug').get(locationsValidation.getDetail, locationsController.getDetail);
router.route('/list').get(locationsController.getList);

router.route('/delete').post(authorize(), locationsValidation.delete, locationsController.delete);
router.route('/create').post(authorize(), locationsValidation.create, locationsController.create);
router.route('/update').post(authorize(), locationsValidation.update, locationsController.update);

export default router;
