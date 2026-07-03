import Meeting from '../model/meeting.model.js'
import Message from '../model/message.model.js'
import Notification from '../model/notification.model.js'
import Task from '../model/task.model.js'
import Team from '../model/team.model.js'

const getAnalytics = async (req, res, next) => {
  try {
    const [meetings, tasks, teams, messages, unreadNotifications] = await Promise.all([
      Meeting.find({ $or: [{ host: req.user._id }, { participants: req.user._id }] }),
      Task.find({ $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }] }),
      Team.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }),
      Message.countDocuments(),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ])

    const taskStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    const meetingStatus = meetings.reduce((acc, meeting) => {
      acc[meeting.status] = (acc[meeting.status] || 0) + 1
      return acc
    }, {})

    res.status(200).json({
      analytics: {
        totals: {
          meetings: meetings.length,
          tasks: tasks.length,
          teams: teams.length,
          messages,
          unreadNotifications,
        },
        taskStatus,
        meetingStatus,
        productivityScore: Math.min(
          100,
          Math.round(((taskStatus.done || 0) / Math.max(tasks.length, 1)) * 100),
        ),
      },
    })
  } catch (error) {
    next(error)
  }
}

export { getAnalytics }
