import mongoose from 'mongoose'

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'authUser' }],
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'room' },
    roomId: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    recordingUrl: { type: String, trim: true, default: '' },
    transcript: { type: String, default: '' },
  },
  { timestamps: true },
)

const Meeting = mongoose.model('meeting', meetingSchema)

export default Meeting
