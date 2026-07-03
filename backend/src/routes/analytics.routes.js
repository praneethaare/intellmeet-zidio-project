import { Router } from 'express'
import { getAnalytics } from '../controller/analytics.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const analyticsRoutes = Router()

analyticsRoutes.use(checkAuth)
analyticsRoutes.get('/', getAnalytics)

export default analyticsRoutes
