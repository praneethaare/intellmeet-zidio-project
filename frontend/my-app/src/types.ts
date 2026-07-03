export type User = {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  verified: boolean
}

export type Person = {
  _id: string
  username: string
  email: string
}

export type Room = {
  _id: string
  roomId: string
  roomName: string
  createdBy: Person | string
  members: Person[] | string[]
  isExpire: boolean
  createdAt: string
}

export type Team = {
  _id: string
  name: string
  description: string
  owner: Person | string
  members: Person[] | string[]
  pendingInvites?: Array<{
    email: string
    invitedAt: string
  }>
  createdAt: string
}

export type TeamInvitation = {
  teamId: string
  teamName: string
  description: string
  owner: Person
  invitedAt: string
}

export type Meeting = {
  _id: string
  title: string
  description: string
  host: Person | string
  participants: Person[] | string[]
  roomId: string
  startTime: string
  endTime?: string
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  transcript?: string
  recordingUrl?: string
}

export type Message = {
  _id?: string
  roomId: string
  sender: Person | string
  message: string
  type: 'text' | 'system'
  createdAt: string
}

export type Task = {
  _id: string
  title: string
  description: string
  createdBy: Person | string
  assignedTo?: Person | string
  team?: Team | string
  meeting?: Meeting | string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
}

export type MeetingSummary = {
  _id: string
  meeting: Meeting | string
  notes: string
  transcript: string
  summary: string
  actionItems: Array<{
    _id?: string
    text: string
    assignee?: Person | string
    completed: boolean
  }>
  generatedBy: 'manual' | 'local-ai'
  updatedAt: string
}

export type Notification = {
  _id: string
  title: string
  message: string
  type: 'team' | 'meeting' | 'task' | 'room' | 'system'
  read: boolean
  link?: string
  createdAt: string
}

export type Analytics = {
  totals: {
    meetings: number
    tasks: number
    teams: number
    messages: number
    unreadNotifications: number
  }
  taskStatus: Record<string, number>
  meetingStatus: Record<string, number>
  productivityScore: number
}

export type ApiError = {
  message: string
}
