import express from 'express';
import userRoute from './users.route';
import authRoute from './auth.route';
import geoLocationRoute from './geoLocation.route';
import categoriesRoute from './categories.route';
import categoriesFieldsRoute from './categoriesFields.route';
import citiesRoute from './cities.route';
import mediaRoute from './media.route';
import locationsRoute from './locations.route';
import cityRatesRoute from './cityRates.route';
import likesRoute from './likes.route';
import bookmarksRoute from './bookmarks.route';
import feedRoute from './feed.route';

const router = express.Router();

router.use('/users', userRoute);
router.use('/auth', authRoute);
router.use('/geoLocation', geoLocationRoute);
router.use('/categories', categoriesRoute);
router.use('/categoriesFields', categoriesFieldsRoute);
router.use('/cities', citiesRoute);
router.use('/cityRates', cityRatesRoute);
router.use('/media', mediaRoute);
router.use('/locations', locationsRoute);
router.use('/likes', likesRoute);
router.use('/feed', feedRoute);
router.use('/bookmarks', bookmarksRoute);

export default router;
