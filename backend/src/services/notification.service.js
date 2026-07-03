import Notification from '../model/notification.model.js'
import { getIO } from '../socket.io/socketManager.js'

const createNotification = async ({ user, title, message, type = 'system', link = '' }) => {
  const notification = await Notification.create({ user, title, message, type, link })

  try {
    getIO().to(`user:${user}`).emit('new-notification', notification)
  } catch {
    // Socket.IO may not be initialized in tests or scripts.
  }

  return notification
}

export { createNotification }
