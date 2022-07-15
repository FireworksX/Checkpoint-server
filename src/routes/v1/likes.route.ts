import express from 'express';
import likesValidation from '@server/validations/likes.validation';
import likesController from '@server/controllers/likes.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/add').post(authorize(), likesValidation.add, likesController.add);
router.route('/remove').post(authorize(), likesValidation.remove, likesController.remove);

export default router;
