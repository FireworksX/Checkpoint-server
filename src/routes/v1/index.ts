import express from 'express'
import userRoute from './users.route'
import authRoute from './auth.route'
import geoLocationRoute from './geoLocation.route'

const router = express.Router()

router.use('/users', userRoute)
router.use('/auth', authRoute)
router.use('/geoLocation', geoLocationRoute)

export default router
