import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'authUser' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'team' },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'meeting' },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
  },
  { timestamps: true },
)

const Task = mongoose.model('task', taskSchema)

export default Task
