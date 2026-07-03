import express from 'express' 
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import authUserRoutes from './routes/userAuth.routes.js'
import swaggerui from 'swagger-ui-express'
import swaggerSpec from './config/swagger.config.js'
import Room from  './routes/room.routes.js'
import teamRoutes from './routes/team.routes.js'
import meetingRoutes from './routes/meeting.routes.js'
import messageRoutes from './routes/message.routes.js'
import taskRoutes from './routes/task.routes.js'
import summaryRoutes from './routes/summary.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import analyticsRoutes from './routes/analytics.routes.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import credentials from './config/config.js'




const app = express()
app.set('trust proxy', 1)
app.use(cookieParser())

const allowedOrigins = new Set([
  credentials.frontend_url,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

const isAllowedPreviewOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin)
    return hostname.endsWith('.vercel.app') || hostname.endsWith('.netlify.app')
  } catch {
    return false
  }
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isAllowedPreviewOrigin(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
}))
app.use(helmet({
  contentSecurityPolicy: false,
}))
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(
  "/api-docs",
  swaggerui.serve,
  swaggerui.setup(swaggerSpec)
);
app.use('/api/auth', authUserRoutes)
app.use('/api/rooms', Room)
app.use('/api/teams', teamRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/summaries', summaryRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default  app
