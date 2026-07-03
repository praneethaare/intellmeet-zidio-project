import Team from '../model/team.model.js'
import authUser from '../model/userAuth.model.js'
import { createNotification } from '../services/notification.service.js'
import { normalizeEmail, validateEmail } from '../utils/validation.js'

const createTeam = async (req, res, next) => {
  try {
    const name = req.body.name?.trim()
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' })
    }

    const team = await Team.create({
      name,
      description: req.body.description?.trim() || '',
      owner: req.user._id,
      members: [req.user._id],
    })

    res.status(201).json({ message: 'Team created successfully', team })
  } catch (error) {
    next(error)
  }
}

const inviteMember = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email)
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }

    const team = await Team.findOne({ _id: req.params.teamId, owner: req.user._id })
    if (!team) {
      return res.status(404).json({ message: 'Team not found or access denied' })
    }

    const invitedUser = await authUser.findOne({ email })
    if (!invitedUser) {
      return res.status(404).json({ message: 'No registered user has this email' })
    }
    if (team.members.some((memberId) => memberId.equals(invitedUser._id))) {
      return res.status(409).json({ message: 'User is already a team member' })
    }
    if (team.pendingInvites.some((invite) => invite.email === email)) {
      return res.status(409).json({ message: 'An invitation is already pending' })
    }

    team.pendingInvites.push({ email, invitedBy: req.user._id })
    await team.save()

    await createNotification({
      user: invitedUser._id,
      title: 'Team invitation',
      message: `${req.user.username} invited you to join ${team.name}`,
      type: 'team',
      link: `/teams/${team._id}`,
    })

    res.status(200).json({ message: 'Team invitation created successfully' })
  } catch (error) {
    next(error)
  }
}

const acceptInvite = async (req, res, next) => {
  try {
    const team = await Team.findOne({
      _id: req.params.teamId,
      'pendingInvites.email': req.user.email,
    })
    if (!team) {
      return res.status(404).json({ message: 'Pending invitation not found' })
    }

    team.pendingInvites = team.pendingInvites.filter(
      (invite) => invite.email !== req.user.email,
    )
    if (!team.members.some((memberId) => memberId.equals(req.user._id))) {
      team.members.push(req.user._id)
    }
    await team.save()

    res.status(200).json({ message: 'Team invitation accepted', team })
  } catch (error) {
    next(error)
  }
}

const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner members', 'username email')
      .sort({ createdAt: -1 })

    res.status(200).json({ teams })
  } catch (error) {
    next(error)
  }
}

const getPendingInvites = async (req, res, next) => {
  try {
    const teams = await Team.find({
      'pendingInvites.email': req.user.email,
    })
      .select('name description owner pendingInvites createdAt')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })

    const invitations = teams.map((team) => {
      const invite = team.pendingInvites.find(
        (item) => item.email === req.user.email,
      )

      return {
        teamId: team._id,
        teamName: team.name,
        description: team.description,
        owner: team.owner,
        invitedAt: invite?.invitedAt,
      }
    })

    res.status(200).json({ invitations })
  } catch (error) {
    next(error)
  }
}

const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({
      _id: req.params.teamId,
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate('owner members', 'username email')

    if (!team) {
      return res.status(404).json({ message: 'Team not found or access denied' })
    }

    res.status(200).json({ team })
  } catch (error) {
    next(error)
  }
}

const removeMember = async (req, res, next) => {
  try {
    if (String(req.params.userId) === String(req.user._id)) {
      return res.status(400).json({ message: 'The team owner cannot be removed' })
    }

    const team = await Team.findOneAndUpdate(
      { _id: req.params.teamId, owner: req.user._id },
      { $pull: { members: req.params.userId } },
      { new: true },
    )
    if (!team) {
      return res.status(404).json({ message: 'Team not found or access denied' })
    }

    res.status(200).json({ message: 'Team member removed successfully', team })
  } catch (error) {
    next(error)
  }
}

export {
  acceptInvite,
  createTeam,
  getMyTeams,
  getPendingInvites,
  getTeam,
  inviteMember,
  removeMember,
}
