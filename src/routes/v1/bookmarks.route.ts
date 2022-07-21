import express from 'express';
import bookmarksValidation from '@server/validations/bookmarks.validation';
import bookmarksController from '@server/controllers/bookmarks.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/add').post(authorize(), bookmarksValidation.add, bookmarksController.add);
router.route('/remove').post(authorize(), bookmarksValidation.remove, bookmarksController.remove);

export default router;
