import express from 'express'
import userRoute from './users.route'
import authRoute from './auth.route'
import geoLocationRoute from './geoLocation.route'
import categoriesRoute from './categories.route'
import categoriesFieldsRoute from './categoriesFields.route'
import citiesRoute from './cities.route'

const router = express.Router()

router.use('/users', userRoute)
router.use('/auth', authRoute)
router.use('/geoLocation', geoLocationRoute)
router.use('/categories', categoriesRoute)
router.use('/categoriesFields', categoriesFieldsRoute)
router.use('/cities', citiesRoute)

export default router
