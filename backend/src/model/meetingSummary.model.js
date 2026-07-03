import mongoose from 'mongoose'

const actionItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser' },
    completed: { type: Boolean, default: false },
  },
  { _id: true },
)

const meetingSummarySchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'meeting', required: true },
    notes: { type: String, default: '' },
    transcript: { type: String, default: '' },
    summary: { type: String, default: '' },
    actionItems: [actionItemSchema],
    generatedBy: {
      type: String,
      enum: ['manual', 'local-ai'],
      default: 'manual',
    },
  },
  { timestamps: true },
)

const MeetingSummary = mongoose.model('meetingSummary', meetingSummarySchema)

export default MeetingSummary
