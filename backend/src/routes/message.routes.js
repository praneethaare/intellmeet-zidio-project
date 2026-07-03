import { Router } from 'express'
import {
  createRoomMessage,
  getRoomMessages,
} from '../controller/message.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const messageRoutes = Router()

messageRoutes.use(checkAuth)
messageRoutes.get('/rooms/:roomId', getRoomMessages)
messageRoutes.post('/rooms/:roomId', createRoomMessage)

export default messageRoutes
