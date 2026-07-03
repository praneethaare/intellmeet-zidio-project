import type {
  Analytics,
  Meeting,
  MeetingSummary,
  Message,
  Notification,
  Room,
  Task,
  Team,
  TeamInvitation,
  User,
} from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
const TOKEN_KEY = 'intellmeet_token'

type RequestOptions = RequestInit & {
  authenticated?: boolean
}

export class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (options.authenticated !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new ApiRequestError(
      `Cannot reach backend at ${API_URL}. Check that the backend is running and CORS is configured.`,
      0,
    )
  }

  const data = await response.json().catch(async () => ({
    message: await response.text().catch(() => ''),
  }))
  if (!response.ok) {
    throw new ApiRequestError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
    )
  }

  return data as T
}

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api = {
  register: (payload: { username: string; email: string; password: string }) =>
    request<{ message: string; devOtp?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      authenticated: false,
    }),

  verify: (payload: { email: string; otp: string }) =>
    request<{ message: string; user: User; token: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
      authenticated: false,
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      authenticated: false,
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: User }>('/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      authenticated: false,
    }),

  validateResetOtp: (email: string, otp: string) =>
    request<{ message: string; resetToken: string }>(
      '/auth/validate-forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
        authenticated: false,
      },
    ),

  resetPassword: (resetToken: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, password }),
      authenticated: false,
    }),

  getRooms: () => request<{ rooms: Room[] }>('/rooms'),

  createRoom: (payload: { roomId: string; roomName: string }) =>
    request<{ message: string; room: Room }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  joinRoom: (roomId: string) =>
    request<{ message: string; room: Room }>(
      `/rooms/${encodeURIComponent(roomId)}/join`,
      { method: 'POST' },
    ),

  getTeams: () => request<{ teams: Team[] }>('/teams'),

  getInvitations: () =>
    request<{ invitations: TeamInvitation[] }>('/teams/invitations'),

  createTeam: (payload: { name: string; description: string }) =>
    request<{ message: string; team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  inviteMember: (teamId: string, email: string) =>
    request<{ message: string }>(`/teams/${teamId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  acceptInvitation: (teamId: string) =>
    request<{ message: string; team: Team }>(
      `/teams/${teamId}/invitations/accept`,
      { method: 'POST' },
    ),

  getMeetings: () => request<{ meetings: Meeting[] }>('/meetings'),

  createMeeting: (payload: {
    title: string
    description: string
    roomId: string
    startTime: string
    endTime?: string
  }) =>
    request<{ message: string; meeting: Meeting }>('/meetings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMeeting: (meetingId: string, payload: Partial<Meeting>) =>
    request<{ message: string; meeting: Meeting }>(`/meetings/${meetingId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getTasks: () => request<{ tasks: Task[] }>('/tasks'),

  createTask: (payload: {
    title: string
    description: string
    status: Task['status']
    priority: Task['priority']
    dueDate?: string
    team?: string
    meeting?: string
  }) =>
    request<{ message: string; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTask: (taskId: string, payload: Partial<Task>) =>
    request<{ message: string; task: Task }>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getMessages: (roomId: string) =>
    request<{ messages: Message[] }>(`/messages/rooms/${encodeURIComponent(roomId)}`),

  sendMessage: (roomId: string, message: string) =>
    request<{ message: string; chatMessage: Message }>(
      `/messages/rooms/${encodeURIComponent(roomId)}`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      },
    ),

  getSummaries: () => request<{ summaries: MeetingSummary[] }>('/summaries'),

  saveSummary: (
    meetingId: string,
    payload: {
      notes: string
      transcript: string
      generate: boolean
      createTasks?: boolean
    },
  ) =>
    request<{ message: string; summary: MeetingSummary }>(
      `/summaries/meetings/${meetingId}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),

  getNotifications: () =>
    request<{ notifications: Notification[] }>('/notifications'),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),

  getAnalytics: () => request<{ analytics: Analytics }>('/analytics'),
}
