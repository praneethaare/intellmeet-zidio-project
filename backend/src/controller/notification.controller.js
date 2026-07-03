import Notification from '../model/notification.model.js'

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)

    res.status(200).json({ notifications })
  } catch (error) {
    next(error)
  }
}

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id },
      { read: true },
      { new: true },
    )
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    res.status(200).json({ message: 'Notification marked as read', notification })
  } catch (error) {
    next(error)
  }
}

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

export { getNotifications, markAllNotificationsRead, markNotificationRead }
