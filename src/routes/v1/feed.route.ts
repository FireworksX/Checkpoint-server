import express from 'express';
import feedValidation from '@server/validations/feed.validation';
import feedController from '@server/controllers/feed.controller';
import { authorize } from '@server/middleware/auth.middleware';

const router = express.Router();

router.route('/users').get(authorize(), feedValidation.users, feedController.getUsersFeed);
router.route('/locations').get(authorize(), feedValidation.locations, feedController.getLocationsFeed);

export default router;
