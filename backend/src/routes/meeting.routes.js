import { Router } from 'express'
import {
  createMeeting,
  deleteMeeting,
  getMeeting,
  getMeetings,
  updateMeeting,
} from '../controller/meeting.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const meetingRoutes = Router()

meetingRoutes.use(checkAuth)
meetingRoutes.post('/', createMeeting)
meetingRoutes.get('/', getMeetings)
meetingRoutes.get('/:meetingId', getMeeting)
meetingRoutes.put('/:meetingId', updateMeeting)
meetingRoutes.delete('/:meetingId', deleteMeeting)

export default meetingRoutes
