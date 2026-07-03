import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'meeting' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser', required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'system'], default: 'text' },
  },
  { timestamps: true },
)

const Message = mongoose.model('message', messageSchema)

export default Message
