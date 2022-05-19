import express from 'express';
import mediaFilesValidation from '@server/validations/mediaFiles.validation';
import mediaFilesController from '@server/controllers/mediaFiles.controller';
import { authorize } from '@server/middleware/auth.middleware';
import { mediaUpload } from '@server/middleware/mediaUpload.middleware';

const router = express.Router();

router
  .route('/upload')
  .post(authorize(), mediaFilesValidation.upload, mediaUpload.single('file'), mediaFilesController.upload);

router.route('/delete').post(authorize(), mediaFilesValidation.delete, mediaFilesController.delete);

export default router;
