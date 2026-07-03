import Message from '../model/message.model.js'
import Room from '../model/room.model.js'

const getRoomMessages = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomId: req.params.roomId,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' })
    }

    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 })
      .limit(100)

    res.status(200).json({ messages })
  } catch (error) {
    next(error)
  }
}

const createRoomMessage = async (req, res, next) => {
  try {
    const text = req.body.message?.trim()
    if (!text) {
      return res.status(400).json({ message: 'Message is required' })
    }

    const room = await Room.findOne({
      roomId: req.params.roomId,
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })

    if (!room) {
      return res.status(404).json({ message: 'Room not found or access denied' })
    }

    const message = await Message.create({
      roomId: req.params.roomId,
      sender: req.user._id,
      message: text,
    })
    await message.populate('sender', 'username email')

    res.status(201).json({ message: 'Message sent', chatMessage: message })
  } catch (error) {
    next(error)
  }
}

export { createRoomMessage, getRoomMessages }
