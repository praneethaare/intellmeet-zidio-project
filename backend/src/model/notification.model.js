import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['team', 'meeting', 'task', 'room', 'system'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true },
)

const Notification = mongoose.model('notification', notificationSchema)

export default Notification
