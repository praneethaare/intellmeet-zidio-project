import Task from '../model/task.model.js'
import Team from '../model/team.model.js'
import { createNotification } from '../services/notification.service.js'

const canAccessTeam = async (teamId, userId) => {
  if (!teamId) return true
  return Team.exists({
    _id: teamId,
    $or: [{ owner: userId }, { members: userId }],
  })
}

const createTask = async (req, res, next) => {
  try {
    const title = req.body.title?.trim()
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' })
    }
    if (!(await canAccessTeam(req.body.team, req.user._id))) {
      return res.status(403).json({ message: 'You do not have access to this team' })
    }

    const task = await Task.create({
      title,
      description: req.body.description?.trim() || '',
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || undefined,
      team: req.body.team || undefined,
      meeting: req.body.meeting || undefined,
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || undefined,
    })

    if (task.assignedTo && String(task.assignedTo) !== String(req.user._id)) {
      await createNotification({
        user: task.assignedTo,
        title: 'New task assigned',
        message: `${req.user.username} assigned you: ${task.title}`,
        type: 'task',
        link: `/tasks/${task._id}`,
      })
    }

    res.status(201).json({ message: 'Task created successfully', task })
  } catch (error) {
    next(error)
  }
}

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
    })
      .populate('createdBy assignedTo', 'username email')
      .populate('team', 'name')
      .populate('meeting', 'title')
      .sort({ createdAt: -1 })

    res.status(200).json({ tasks })
  } catch (error) {
    next(error)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'assignedTo', 'team', 'meeting', 'status', 'priority', 'dueDate']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    )

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
      },
      updates,
      { new: true, runValidators: true },
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied' })
    }

    res.status(200).json({ message: 'Task updated successfully', task })
  } catch (error) {
    next(error)
  }
}

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      createdBy: req.user._id,
    })
    if (!task) {
      return res.status(404).json({ message: 'Task not found or only creator can delete it' })
    }

    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export { createTask, deleteTask, getTasks, updateTask }
