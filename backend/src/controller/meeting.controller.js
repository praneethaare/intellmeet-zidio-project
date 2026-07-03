import Meeting from '../model/meeting.model.js'
import Room from '../model/room.model.js'
import { createNotification } from '../services/notification.service.js'

const createMeeting = async (req, res, next) => {
  try {
    const title = req.body.title?.trim()
    if (!title || !req.body.startTime) {
      return res.status(400).json({ message: 'Title and start time are required' })
    }

    const roomId = req.body.roomId?.trim() || `meet-${Date.now()}`
    let room = await Room.findOne({ roomId })
    if (!room) {
      room = await Room.create({
        createdBy: req.user._id,
        members: [req.user._id],
        roomId,
        roomName: title,
      })
    }

    const participants = Array.from(
      new Set([String(req.user._id), ...(req.body.participants || []).map(String)]),
    )

    const meeting = await Meeting.create({
      title,
      description: req.body.description?.trim() || '',
      host: req.user._id,
      participants,
      room: room._id,
      roomId,
      startTime: req.body.startTime,
      endTime: req.body.endTime || undefined,
      status: req.body.status || 'scheduled',
    })

    await Promise.all(
      participants
        .filter((userId) => userId !== String(req.user._id))
        .map((userId) =>
          createNotification({
            user: userId,
            title: 'New meeting invite',
            message: `${req.user.username} invited you to ${meeting.title}`,
            type: 'meeting',
            link: `/meetings/${meeting._id}`,
          }),
        ),
    )

    res.status(201).json({ message: 'Meeting created successfully', meeting })
  } catch (error) {
    next(error)
  }
}

const getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    })
      .populate('host participants', 'username email')
      .sort({ startTime: -1 })

    res.status(200).json({ meetings })
  } catch (error) {
    next(error)
  }
}

const getMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.meetingId,
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    }).populate('host participants', 'username email')

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or access denied' })
    }

    res.status(200).json({ meeting })
  } catch (error) {
    next(error)
  }
}

const updateMeeting = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'startTime', 'endTime', 'status', 'transcript', 'recordingUrl']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    )

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.meetingId, host: req.user._id },
      updates,
      { new: true, runValidators: true },
    )

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or only host can update it' })
    }

    res.status(200).json({ message: 'Meeting updated successfully', meeting })
  } catch (error) {
    next(error)
  }
}

const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.meetingId,
      host: req.user._id,
    })
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or only host can delete it' })
    }

    res.status(200).json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export { createMeeting, deleteMeeting, getMeeting, getMeetings, updateMeeting }
