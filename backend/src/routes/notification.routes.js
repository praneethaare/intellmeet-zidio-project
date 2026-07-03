import { Router } from 'express'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../controller/notification.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const notificationRoutes = Router()

notificationRoutes.use(checkAuth)
notificationRoutes.get('/', getNotifications)
notificationRoutes.patch('/read-all', markAllNotificationsRead)
notificationRoutes.patch('/:notificationId/read', markNotificationRead)

export default notificationRoutes
