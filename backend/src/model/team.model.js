import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'authUser',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'authUser',
      },
    ],
    pendingInvites: [
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'authUser',
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
)

const Team = mongoose.model('team', teamSchema)

export default Team
