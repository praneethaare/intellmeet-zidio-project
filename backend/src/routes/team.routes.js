import { Router } from 'express'
import {
  acceptInvite,
  createTeam,
  getMyTeams,
  getPendingInvites,
  getTeam,
  inviteMember,
  removeMember,
} from '../controller/team.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const teamRoutes = Router()

teamRoutes.use(checkAuth)
teamRoutes.post('/', createTeam)
teamRoutes.get('/', getMyTeams)
teamRoutes.get('/invitations', getPendingInvites)
teamRoutes.get('/:teamId', getTeam)
teamRoutes.post('/:teamId/invitations', inviteMember)
teamRoutes.post('/:teamId/invitations/accept', acceptInvite)
teamRoutes.delete('/:teamId/members/:userId', removeMember)

export default teamRoutes
