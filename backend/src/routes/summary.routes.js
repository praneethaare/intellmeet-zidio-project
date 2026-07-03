import { Router } from 'express'
import { getSummaries, upsertSummary } from '../controller/summary.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const summaryRoutes = Router()

summaryRoutes.use(checkAuth)
summaryRoutes.get('/', getSummaries)
summaryRoutes.post('/meetings/:meetingId', upsertSummary)

export default summaryRoutes
