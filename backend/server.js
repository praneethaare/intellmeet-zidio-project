import app from './src/app.js'
import credentials from './src/config/config.js'
import connectDb from './src/db/db.js'
import {connectRedis} from './src/utils/redis.js'
import http from 'http'
import { initSocket,getIO}  from './src/socket.io/socketManager.js'

import {registerSocket}  from './src/socket.io/index.io.js'

const server = http.createServer(app);
const PORT = credentials.port || 5000

const startServer = async () => {
  await connectDb()
  await connectRedis()

  initSocket(server)
  registerSocket(getIO())

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})
