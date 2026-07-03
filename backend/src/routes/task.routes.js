import { Router } from 'express'
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../controller/task.controller.js'
import checkAuth from '../middleware/authCheck.middleware.js'

const taskRoutes = Router()

taskRoutes.use(checkAuth)
taskRoutes.post('/', createTask)
taskRoutes.get('/', getTasks)
taskRoutes.put('/:taskId', updateTask)
taskRoutes.delete('/:taskId', deleteTask)

export default taskRoutes
