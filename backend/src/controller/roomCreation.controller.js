import Room from '../model/room.model.js'

const createRoom = async (req, res, next) => {
  try {
    const roomId = req.body.roomId?.trim()
    const roomName = req.body.roomName?.trim()

    if (!roomName || !roomId) {
      return res.status(400).json({ message: 'Room name and roomId are required' })
    }

    const newRoom = await Room.create({
      createdBy: req.user._id,
      members: [req.user._id],
      roomId,
      roomName,
      isExpire: Boolean(req.body.isExpire),
    })

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
    })
  } catch (error) {
    next(error)
  }
}

export { createRoom }
