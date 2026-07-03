import Meeting from '../model/meeting.model.js'
import MeetingSummary from '../model/meetingSummary.model.js'
import Task from '../model/task.model.js'
import { generateLocalMeetingSummary } from '../services/ai.service.js'

const getSummaries = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    }).select('_id')

    const summaries = await MeetingSummary.find({
      meeting: { $in: meetings.map((meeting) => meeting._id) },
    })
      .populate('meeting', 'title startTime status')
      .populate('actionItems.assignee', 'username email')
      .sort({ updatedAt: -1 })

    res.status(200).json({ summaries })
  } catch (error) {
    next(error)
  }
}

const upsertSummary = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.meetingId,
      $or: [{ host: req.user._id }, { participants: req.user._id }],
    })

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found or access denied' })
    }

    const shouldGenerate = Boolean(req.body.generate)
    const sourceText = [req.body.notes, req.body.transcript, meeting.transcript]
      .filter(Boolean)
      .join('\n')

    const generated = shouldGenerate
      ? generateLocalMeetingSummary(sourceText)
      : { summary: req.body.summary || '', actionItems: req.body.actionItems || [] }

    const summary = await MeetingSummary.findOneAndUpdate(
      { meeting: meeting._id },
      {
        notes: req.body.notes || '',
        transcript: req.body.transcript || meeting.transcript || '',
        summary: generated.summary,
        actionItems: generated.actionItems,
        generatedBy: shouldGenerate ? 'local-ai' : 'manual',
      },
      { new: true, upsert: true, runValidators: true },
    )

    if (req.body.createTasks) {
      await Task.insertMany(
        summary.actionItems.map((item) => ({
          title: item.text,
          description: `Generated from meeting: ${meeting.title}`,
          createdBy: req.user._id,
          assignedTo: item.assignee,
          meeting: meeting._id,
          status: 'todo',
          priority: 'medium',
        })),
      )
    }

    res.status(200).json({ message: 'Meeting summary saved', summary })
  } catch (error) {
    next(error)
  }
}

export { getSummaries, upsertSummary }
