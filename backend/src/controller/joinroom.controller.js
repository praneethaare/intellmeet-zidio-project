import Room from '../model/room.model.js'

const joinRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId, isExpire: false },
      { $addToSet: { members: req.user._id } },
      { new: true },
    ).populate('createdBy members', 'username email')

    if (!room) {
      return res.status(404).json({ message: 'Active room not found' })
    }

    res.status(200).json({
      message: 'Joined room successfully',
      room,
    })
  } catch (error) {
    next(error)
  }
}

const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })

    res.status(200).json({ rooms })
  } catch (error) {
    next(error)
  }
}

export { getMyRooms, joinRoom }
