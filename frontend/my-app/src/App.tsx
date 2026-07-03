import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ApiRequestError, api, session } from './api'
import type {
  Analytics,
  Meeting,
  MeetingSummary,
  Message,
  Notification,
  Person,
  Room,
  Task,
  Team,
  TeamInvitation,
  User,
} from './types'
import './App.css'

type AuthMode =
  | 'login'
  | 'register'
  | 'verify'
  | 'forgot'
  | 'reset-otp'
  | 'new-password'

type View = 'overview' | 'rooms' | 'meetings' | 'tasks' | 'summaries' | 'analytics' | 'teams' | 'profile'
type Modal =
  | 'create-room'
  | 'join-room'
  | 'create-team'
  | 'invite'
  | 'create-meeting'
  | 'create-task'
  | 'create-summary'
  | null

type IconName =
  | 'arrow'
  | 'bell'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'copy'
  | 'dashboard'
  | 'door'
  | 'email'
  | 'eye'
  | 'eyeOff'
  | 'lock'
  | 'logout'
  | 'menu'
  | 'plus'
  | 'search'
  | 'settings'
  | 'team'
  | 'user'
  | 'video'

const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  door: <><path d="M4 21h16M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M10 12h.01"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="m3 3 18 18"/><path d="M10.6 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-2.1 3.1M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.1-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  team: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
}

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => (
  <svg
    className="icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths[name]}
  </svg>
)

const getErrorMessage = (error: unknown) =>
  error instanceof ApiRequestError || error instanceof Error
    ? error.message
    : 'Something went wrong'

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const peopleCount = (items: Person[] | string[] | undefined) => items?.length || 0

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(Boolean(session.getToken()))
  const [rooms, setRooms] = useState<Room[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [summaries, setSummaries] = useState<MeetingSummary[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [view, setView] = useState<View>('overview')
  const [activeRoom, setActiveRoom] = useState<Room | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  const loadWorkspace = useCallback(async () => {
    const [
      roomData,
      teamData,
      inviteData,
      meetingData,
      taskData,
      summaryData,
      notificationData,
      analyticsData,
    ] = await Promise.all([
      api.getRooms(),
      api.getTeams(),
      api.getInvitations(),
      api.getMeetings(),
      api.getTasks(),
      api.getSummaries(),
      api.getNotifications(),
      api.getAnalytics(),
    ])
    setRooms(roomData.rooms)
    setTeams(teamData.teams)
    setInvitations(inviteData.invitations)
    setMeetings(meetingData.meetings)
    setTasks(taskData.tasks)
    setSummaries(summaryData.summaries)
    setNotifications(notificationData.notifications)
    setAnalytics(analyticsData.analytics)
  }, [])

  useEffect(() => {
    if (!session.getToken()) return
    api
      .me()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        return loadWorkspace()
      })
      .catch(() => {
        session.clear()
        setUser(null)
      })
      .finally(() => setBooting(false))
  }, [loadWorkspace])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const handleAuthenticated = async (currentUser: User, token: string) => {
    session.setToken(token)
    setUser(currentUser)
    setBooting(true)
    try {
      await loadWorkspace()
    } finally {
      setBooting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch {
      // Local cleanup still signs the user out when the backend session expired.
    }
    session.clear()
    setUser(null)
    setRooms([])
    setTeams([])
    setInvitations([])
    setMeetings([])
    setTasks([])
    setSummaries([])
    setNotifications([])
    setAnalytics(null)
    setActiveRoom(null)
    setView('overview')
  }

  if (booting) {
    return (
      <div className="app-loader">
        <BrandMark />
        <div className="loader-ring" />
        <p>Preparing your workspace</p>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        view={view}
        mobileOpen={mobileNav}
        onClose={() => setMobileNav(false)}
        onNavigate={(nextView) => {
          setView(nextView)
          setMobileNav(false)
        }}
        onLogout={handleLogout}
      />

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation">
            <Icon name="menu" />
          </button>
          <div className="topbar-heading">
            <span className="eyebrow">Workspace</span>
            <strong>{view[0].toUpperCase() + view.slice(1)}</strong>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Icon name="search" size={18} />
              <input aria-label="Search workspace" placeholder="Search workspace" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" onClick={() => setView('analytics')} aria-label="Notifications">
              <Icon name="bell" />
              {(unreadCount > 0 || invitations.length > 0) && <span className="notification-dot" />}
            </button>
            <button className="profile-chip" onClick={() => setView('profile')}>
              <span className="avatar small">{initials(user.username)}</span>
              <span>
                <strong>{user.username}</strong>
                <small>{user.role}</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </header>

        <div className="workspace-content">
          {view === 'overview' && (
            <Overview
              user={user}
              rooms={rooms}
              teams={teams}
              meetings={meetings}
              tasks={tasks}
              invitations={invitations}
              onCreateRoom={() => setModal('create-room')}
              onJoinRoom={() => setModal('join-room')}
              onCreateTeam={() => setModal('create-team')}
              onCreateMeeting={() => setModal('create-meeting')}
              onCreateTask={() => setModal('create-task')}
              onOpenRoom={(room) => {
                setActiveRoom(room)
                setView('rooms')
              }}
              onAccept={async (teamId) => {
                try {
                  const result = await api.acceptInvitation(teamId)
                  setToast(result.message)
                  await loadWorkspace()
                } catch (error) {
                  setToast(getErrorMessage(error))
                }
              }}
              onView={(nextView) => setView(nextView)}
            />
          )}

          {view === 'rooms' && (
            activeRoom ? (
              <RoomDetailView room={activeRoom} onBack={() => setActiveRoom(null)} />
            ) : (
              <RoomsView
                rooms={rooms}
                onCreate={() => setModal('create-room')}
                onJoin={() => setModal('join-room')}
                onOpen={(room) => setActiveRoom(room)}
              />
            )
          )}

          {view === 'meetings' && (
            <MeetingsView
              meetings={meetings}
              onCreate={() => setModal('create-meeting')}
              onUpdate={async (meeting, status) => {
                try {
                  const result = await api.updateMeeting(meeting._id, { status })
                  if (status === 'live') {
                    const joinedRoom = await api.joinRoom(meeting.roomId)
                    setActiveRoom(joinedRoom.room)
                    setView('rooms')
                    setToast('Meeting is live. Room lobby opened.')
                  } else {
                    setToast(result.message)
                  }
                  await loadWorkspace()
                } catch (error) {
                  setToast(getErrorMessage(error))
                }
              }}
            />
          )}

          {view === 'tasks' && (
            <TasksView
              tasks={tasks}
              onCreate={() => setModal('create-task')}
              onMove={async (task, status) => {
                try {
                  const result = await api.updateTask(task._id, { status })
                  setToast(result.message)
                  await loadWorkspace()
                } catch (error) {
                  setToast(getErrorMessage(error))
                }
              }}
            />
          )}

          {view === 'summaries' && (
            <SummariesView
              meetings={meetings}
              summaries={summaries}
              onCreate={() => setModal('create-summary')}
            />
          )}

          {view === 'analytics' && (
            <AnalyticsView analytics={analytics} notifications={notifications} />
          )}

          {view === 'teams' && (
            <TeamsView
              teams={teams}
              invitations={invitations}
              onCreate={() => setModal('create-team')}
              onInvite={(team) => {
                setSelectedTeam(team)
                setModal('invite')
              }}
              onAccept={async (teamId) => {
                try {
                  const result = await api.acceptInvitation(teamId)
                  setToast(result.message)
                  await loadWorkspace()
                } catch (error) {
                  setToast(getErrorMessage(error))
                }
              }}
            />
          )}

          {view === 'profile' && <ProfileView user={user} rooms={rooms} teams={teams} />}
        </div>
      </main>

      {modal && (
        <ActionModal
          modal={modal}
          selectedTeam={selectedTeam}
          meetings={meetings}
          teams={teams}
          onClose={() => {
            setModal(null)
            setSelectedTeam(null)
          }}
          onComplete={async (message) => {
            setModal(null)
            setSelectedTeam(null)
            setToast(message)
            await loadWorkspace()
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon"><Icon name="check" size={16} /></span>
          {toast}
        </div>
      )}
    </div>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'compact' : ''}`}>
      <span className="brand-symbol">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-name">Intell<span>Meet</span></span>
    </div>
  )
}

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: User, token: string) => Promise<void>
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const form = new FormData(event.currentTarget)

    try {
      if (mode === 'login') {
        const result = await api.login({
          email: String(form.get('email')),
          password: String(form.get('password')),
        })
        await onAuthenticated(result.user, result.token)
      }

      if (mode === 'register') {
        const registrationEmail = String(form.get('email'))
        const result = await api.register({
          username: String(form.get('username')),
          email: registrationEmail,
          password: String(form.get('password')),
        })
        setEmail(registrationEmail)
        setMessage(
          result.devOtp
            ? `${result.message} Your development OTP is ${result.devOtp}.`
            : result.message,
        )
        setMode('verify')
      }

      if (mode === 'verify') {
        const verificationEmail = String(form.get('email'))
        const result = await api.verify({
          email: verificationEmail,
          otp: String(form.get('otp')),
        })
        await onAuthenticated(result.user, result.token)
      }

      if (mode === 'forgot') {
        const resetEmail = String(form.get('email'))
        const result = await api.forgotPassword(resetEmail)
        setEmail(resetEmail)
        setMessage(result.message)
        setMode('reset-otp')
      }

      if (mode === 'reset-otp') {
        const result = await api.validateResetOtp(
          String(form.get('email')),
          String(form.get('otp')),
        )
        setResetToken(result.resetToken)
        setMessage(result.message)
        setMode('new-password')
      }

      if (mode === 'new-password') {
        const password = String(form.get('password'))
        const confirmPassword = String(form.get('confirmPassword'))
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const result = await api.resetPassword(resetToken, password)
        setMessage(result.message)
        setMode('login')
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<AuthMode, { eyebrow: string; title: string; subtitle: string }> = {
    login: {
      eyebrow: 'Welcome back',
      title: 'Sign in to your workspace',
      subtitle: 'Continue where your team left off.',
    },
    register: {
      eyebrow: 'Create an account',
      title: 'Bring your team together',
      subtitle: 'Start collaborating in a focused workspace.',
    },
    verify: {
      eyebrow: 'Check your inbox',
      title: 'Verify your email',
      subtitle: 'Enter the six-digit code sent to your email.',
    },
    forgot: {
      eyebrow: 'Account recovery',
      title: 'Reset your password',
      subtitle: 'We will send a secure code to your email.',
    },
    'reset-otp': {
      eyebrow: 'Account recovery',
      title: 'Enter your reset code',
      subtitle: 'The code expires five minutes after it is sent.',
    },
    'new-password': {
      eyebrow: 'Almost there',
      title: 'Choose a new password',
      subtitle: 'Use at least eight characters.',
    },
  }

  const current = titles[mode]

  return (
    <div className="auth-page">
      <section className="auth-story">
        <BrandMark />
        <div className="story-copy">
          <span className="story-pill"><span /> Built for teams that move fast</span>
          <h1>Meet less.<br /><em>Achieve more.</em></h1>
          <p>
            One intelligent workspace for meetings, team rooms, decisions, and
            everything that happens next.
          </p>
          <div className="story-features">
            <div><span><Icon name="video" /></span><p><strong>Focused rooms</strong><small>Bring the right people into every conversation.</small></p></div>
            <div><span><Icon name="team" /></span><p><strong>Connected teams</strong><small>Organize members and invitations in one place.</small></p></div>
            <div><span><Icon name="check" /></span><p><strong>Clear outcomes</strong><small>Turn collaboration into visible progress.</small></p></div>
          </div>
        </div>
        <div className="story-orbit orbit-one" />
        <div className="story-orbit orbit-two" />
        <p className="story-footer">Intelligent collaboration, thoughtfully designed.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><BrandMark /></div>
        <div className="auth-card">
          <span className="eyebrow">{current.eyebrow}</span>
          <h2>{current.title}</h2>
          <p className="auth-subtitle">{current.subtitle}</p>

          {message && <div className="form-message success"><Icon name="check" size={16} />{message}</div>}
          {error && <div className="form-message error">{error}</div>}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <Field icon="user" label="Full name" name="username" placeholder="Your name" autoComplete="name" />
            )}

            {mode !== 'new-password' && (
              <Field
                icon="email"
                label="Email address"
                name="email"
                type="email"
                placeholder="you@company.com"
                defaultValue={email}
                autoComplete="email"
              />
            )}

            {(mode === 'verify' || mode === 'reset-otp') && (
              <Field icon="lock" label="Verification code" name="otp" placeholder="000000" inputMode="numeric" maxLength={6} />
            )}

            {(mode === 'login' || mode === 'register' || mode === 'new-password') && (
              <Field
                icon="lock"
                label={mode === 'new-password' ? 'New password' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                action={
                  <button type="button" className="field-action" onClick={() => setShowPassword((visible) => !visible)} aria-label="Toggle password visibility">
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                }
              />
            )}

            {mode === 'new-password' && (
              <Field icon="lock" label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" autoComplete="new-password" />
            )}

            {mode === 'login' && (
              <div className="form-options">
                <label className="check-label"><input type="checkbox" /><span>Remember me</span></label>
                <button type="button" className="text-button" onClick={() => switchMode('forgot')}>Forgot password?</button>
              </div>
            )}

            <button className="primary-button full" disabled={loading}>
              {loading ? <span className="button-spinner" /> : (
                <>
                  {mode === 'login' && 'Sign in'}
                  {mode === 'register' && 'Create account'}
                  {mode === 'verify' && 'Verify and continue'}
                  {mode === 'forgot' && 'Send reset code'}
                  {mode === 'reset-otp' && 'Verify code'}
                  {mode === 'new-password' && 'Update password'}
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <>New to IntellMeet? <button onClick={() => switchMode('register')}>Create an account</button></>
            ) : mode === 'register' ? (
              <>Already have an account? <button onClick={() => switchMode('login')}>Sign in</button></>
            ) : (
              <button onClick={() => switchMode('login')}>Back to sign in</button>
            )}
          </div>
        </div>
        <p className="legal-copy">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </section>
    </div>
  )
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: IconName
  label: string
  action?: ReactNode
}

function Field({ icon, label, action, ...props }: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-control">
        <Icon name={icon} size={18} />
        <input required {...props} />
        {action}
      </span>
    </label>
  )
}

function Sidebar({
  user,
  view,
  mobileOpen,
  onClose,
  onNavigate,
  onLogout,
}: {
  user: User
  view: View
  mobileOpen: boolean
  onClose: () => void
  onNavigate: (view: View) => void
  onLogout: () => void
}) {
  const navigation: Array<{ id: View; label: string; icon: IconName }> = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'rooms', label: 'Rooms', icon: 'video' },
    { id: 'meetings', label: 'Meetings', icon: 'calendar' },
    { id: 'tasks', label: 'Tasks', icon: 'check' },
    { id: 'summaries', label: 'AI Notes', icon: 'email' },
    { id: 'analytics', label: 'Analytics', icon: 'clock' },
    { id: 'teams', label: 'Teams', icon: 'team' },
    { id: 'profile', label: 'My profile', icon: 'user' },
  ]

  return (
    <>
      {mobileOpen && <button className="nav-scrim" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <BrandMark compact />
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><Icon name="close" /></button>
        </div>
        <nav className="main-nav" aria-label="Workspace navigation">
          <span className="nav-label">Workspace</span>
          {navigation.slice(0, 7).map((item) => (
            <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === 'summaries' && <small className="nav-badge">AI</small>}
            </button>
          ))}
          <span className="nav-label secondary">Account</span>
          <button className={view === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>
            <Icon name="user" size={19} /><span>My profile</span>
          </button>
          <button><Icon name="settings" size={19} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span><Icon name="video" size={18} /></span>
            <strong>Ready for your next room?</strong>
            <p>Create a space and invite your team.</p>
          </div>
          <div className="sidebar-user">
            <span className="avatar">{initials(user.username)}</span>
            <span><strong>{user.username}</strong><small>{user.email}</small></span>
            <button onClick={onLogout} aria-label="Sign out"><Icon name="logout" size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}

function Overview({
  user,
  rooms,
  teams,
  meetings,
  tasks,
  invitations,
  onCreateRoom,
  onJoinRoom,
  onCreateTeam,
  onCreateMeeting,
  onCreateTask,
  onOpenRoom,
  onAccept,
  onView,
}: {
  user: User
  rooms: Room[]
  teams: Team[]
  meetings: Meeting[]
  tasks: Task[]
  invitations: TeamInvitation[]
  onCreateRoom: () => void
  onJoinRoom: () => void
  onCreateTeam: () => void
  onCreateMeeting: () => void
  onCreateTask: () => void
  onOpenRoom: (room: Room) => void
  onAccept: (teamId: string) => void
  onView: (view: View) => void
}) {
  const totalMembers = useMemo(
    () => teams.reduce((sum, team) => sum + peopleCount(team.members), 0),
    [teams],
  )

  return (
    <>
      <section className="welcome-row">
        <div>
          <span className="eyebrow">Good to see you</span>
          <h1>Welcome back, {user.username.split(' ')[0]}.</h1>
          <p>Here is what is happening across your workspace today.</p>
        </div>
        <div className="welcome-actions">
          <button className="secondary-button" onClick={onJoinRoom}><Icon name="door" size={18} />Join room</button>
          <button className="primary-button" onClick={onCreateRoom}><Icon name="plus" size={18} />Create room</button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Active rooms" value={rooms.length} detail="Available to join" icon="video" tone="violet" />
        <StatCard label="Your teams" value={teams.length} detail={`${totalMembers} member connections`} icon="team" tone="blue" />
        <StatCard label="Meetings" value={meetings.length} detail="Scheduled and completed" icon="calendar" tone="amber" />
        <StatCard label="Tasks" value={tasks.length} detail={`${tasks.filter((task) => task.status === 'done').length} completed`} icon="check" tone="green" />
      </section>

      <section className="dashboard-grid">
        <div className="panel recent-panel">
          <PanelHeading title="Recent rooms" subtitle="Continue your latest collaboration" action="View all" onAction={() => onView('rooms')} />
          {rooms.length === 0 ? (
            <EmptyState icon="video" title="No rooms yet" text="Create your first room and start collaborating." action="Create room" onAction={onCreateRoom} />
          ) : (
            <div className="room-list">
              {rooms.slice(0, 4).map((room, index) => (
                <div className="room-row" key={room._id}>
                  <span className={`room-icon tone-${index % 3}`}><Icon name="video" size={19} /></span>
                  <span className="room-info"><strong>{room.roomName}</strong><small><Icon name="clock" size={13} /> Room code {room.roomId}</small></span>
                  <span className="member-count"><Icon name="team" size={15} />{peopleCount(room.members)}</span>
                  <button className="row-action" onClick={() => onOpenRoom(room)}>Open <Icon name="arrow" size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel quick-panel">
          <PanelHeading title="Quick actions" subtitle="Get something moving" />
          <div className="quick-actions">
            <button onClick={onCreateRoom}><span className="quick-icon violet"><Icon name="video" /></span><span><strong>Start a room</strong><small>Create a new meeting space</small></span><Icon name="chevron" size={17} /></button>
            <button onClick={onJoinRoom}><span className="quick-icon blue"><Icon name="door" /></span><span><strong>Join with code</strong><small>Enter an existing room</small></span><Icon name="chevron" size={17} /></button>
            <button onClick={onCreateTeam}><span className="quick-icon green"><Icon name="team" /></span><span><strong>Create a team</strong><small>Organize your collaborators</small></span><Icon name="chevron" size={17} /></button>
            <button onClick={onCreateMeeting}><span className="quick-icon violet"><Icon name="calendar" /></span><span><strong>Schedule meeting</strong><small>Create a meeting with room code</small></span><Icon name="chevron" size={17} /></button>
            <button onClick={onCreateTask}><span className="quick-icon blue"><Icon name="check" /></span><span><strong>Add task</strong><small>Track action items in Kanban</small></span><Icon name="chevron" size={17} /></button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid lower">
        <div className="panel">
          <PanelHeading title="Your teams" subtitle="People you collaborate with" action="Manage teams" onAction={() => onView('teams')} />
          {teams.length === 0 ? (
            <EmptyState icon="team" title="Build your first team" text="Create a team and invite registered members." action="Create team" onAction={onCreateTeam} compact />
          ) : (
            <div className="team-preview-grid">
              {teams.slice(0, 3).map((team, index) => (
                <article className="team-preview" key={team._id}>
                  <span className={`team-logo team-${index % 3}`}>{initials(team.name)}</span>
                  <div><strong>{team.name}</strong><small>{peopleCount(team.members)} members</small></div>
                  <div className="avatar-stack">{[0, 1, 2].slice(0, Math.min(peopleCount(team.members), 3)).map((number) => <span key={number}>{number + 1}</span>)}</div>
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="panel invitation-panel">
          <PanelHeading title="Invitations" subtitle="Teams waiting for you" />
          {invitations.length === 0 ? (
            <div className="all-clear"><span><Icon name="check" /></span><div><strong>All caught up</strong><p>No pending team invitations.</p></div></div>
          ) : invitations.slice(0, 2).map((invite) => (
            <div className="invite-row" key={invite.teamId}>
              <span className="team-logo small-logo">{initials(invite.teamName)}</span>
              <span><strong>{invite.teamName}</strong><small>From {invite.owner.username}</small></span>
              <button onClick={() => onAccept(invite.teamId)}>Accept</button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string | number; detail: string; icon: IconName; tone: string }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}><Icon name={icon} /></span>
      <div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div>
    </article>
  )
}

function PanelHeading({ title, subtitle, action, onAction }: { title: string; subtitle: string; action?: string; onAction?: () => void }) {
  return (
    <div className="panel-heading">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action && <button onClick={onAction}>{action}<Icon name="arrow" size={15} /></button>}
    </div>
  )
}

function EmptyState({ icon, title, text, action, onAction, compact = false }: { icon: IconName; title: string; text: string; action: string; onAction: () => void; compact?: boolean }) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <span><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p><button onClick={onAction}>{action}</button>
    </div>
  )
}

function RoomsView({
  rooms,
  onCreate,
  onJoin,
  onOpen,
}: {
  rooms: Room[]
  onCreate: () => void
  onJoin: () => void
  onOpen: (room: Room) => void
}) {
  return (
    <section>
      <PageHeading eyebrow="Collaboration spaces" title="Rooms" text="Create focused spaces for conversations, planning, and team work.">
        <button className="secondary-button" onClick={onJoin}><Icon name="door" size={18} />Join room</button>
        <button className="primary-button" onClick={onCreate}><Icon name="plus" size={18} />Create room</button>
      </PageHeading>
      {rooms.length === 0 ? (
        <div className="panel page-empty"><EmptyState icon="video" title="Your rooms will appear here" text="Create a room or join one using a room code." action="Create your first room" onAction={onCreate} /></div>
      ) : (
        <div className="cards-grid">
          {rooms.map((room, index) => (
            <article className="resource-card" key={room._id}>
              <div className="resource-card-top">
                <span className={`room-art art-${index % 4}`}><Icon name="video" size={25} /></span>
                <span className="status-pill"><span /> Active</span>
              </div>
              <h2>{room.roomName}</h2>
              <p>Room code <strong>{room.roomId}</strong></p>
              <div className="resource-meta">
                <span><Icon name="team" size={15} />{peopleCount(room.members)} members</span>
                <span><Icon name="calendar" size={15} />{new Date(room.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="resource-actions">
                <button className="secondary-button small-button" onClick={() => navigator.clipboard.writeText(room.roomId)}><Icon name="copy" size={16} />Copy code</button>
                <button className="primary-button small-button" onClick={() => onOpen(room)}>Open room<Icon name="arrow" size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function RoomDetailView({ room, onBack }: { room: Room; onBack: () => void }) {
  const members = Array.isArray(room.members) ? room.members : []
  const [messages, setMessages] = useState<Message[]>([])
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    api
      .getMessages(room.roomId)
      .then((data) => setMessages(data.messages))
      .catch((error) => setChatError(getErrorMessage(error)))
  }, [room.roomId])

  const sendChatMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setChatError('')
    const form = new FormData(event.currentTarget)
    const text = String(form.get('message') || '').trim()
    if (!text) return

    try {
      const result = await api.sendMessage(room.roomId, text)
      setMessages((current) => [...current, result.chatMessage])
      event.currentTarget.reset()
    } catch (error) {
      setChatError(getErrorMessage(error))
    }
  }

  return (
    <section>
      <PageHeading
        eyebrow="Room lobby"
        title={room.roomName}
        text="Use this room lobby to share the code, review members, and prepare for live collaboration."
      >
        <button className="secondary-button" onClick={onBack}>
          Back to rooms
        </button>
        <button
          className="primary-button"
          onClick={() => navigator.clipboard.writeText(room.roomId)}
        >
          <Icon name="copy" size={18} />
          Copy code
        </button>
      </PageHeading>

      <div className="room-detail-grid">
        <article className="panel room-hero-panel">
          <span className="room-art large-art"><Icon name="video" size={34} /></span>
          <span className="status-pill"><span /> Active room</span>
          <h2>{room.roomName}</h2>
          <p>
            Share this room code with teammates so they can join the same
            workspace from their dashboard.
          </p>
          <div className="room-code-box">
            <span>Room code</span>
            <strong>{room.roomId}</strong>
            <button onClick={() => navigator.clipboard.writeText(room.roomId)}>
              <Icon name="copy" size={16} />
              Copy
            </button>
          </div>
          <div className="room-detail-actions">
            <button className="primary-button">
              <Icon name="video" size={18} />
              Start live session
            </button>
            <button className="secondary-button">
              <Icon name="team" size={18} />
              Invite members
            </button>
          </div>
        </article>

        <article className="panel">
          <PanelHeading
            title="Room members"
            subtitle={`${peopleCount(room.members)} member${peopleCount(room.members) === 1 ? '' : 's'} joined`}
          />
          {members.length === 0 ? (
            <div className="all-clear">
              <span><Icon name="team" /></span>
              <div>
                <strong>No members loaded</strong>
                <p>Members appear here after they join this room.</p>
              </div>
            </div>
          ) : (
            <div className="member-list">
              {members.map((member, index) => {
                const person =
                  typeof member === 'string'
                    ? { username: `Member ${index + 1}`, email: member }
                    : member

                return (
                  <div className="member-row" key={person.email || index}>
                    <span className="avatar small">{initials(person.username)}</span>
                    <span>
                      <strong>{person.username}</strong>
                      <small>{person.email}</small>
                    </span>
                    <span className="status-pill mini"><span /> Online-ready</span>
                  </div>
                )
              })}
            </div>
          )}
        </article>
      </div>

      <article className="panel room-next-panel">
        <PanelHeading
          title="What this room supports now"
          subtitle="Current backend capability"
        />
        <div className="capability-grid">
          <div><Icon name="check" /><strong>Create and join room</strong><p>Room data is saved in MongoDB.</p></div>
          <div><Icon name="team" /><strong>Member tracking</strong><p>Joining users are added to the room.</p></div>
          <div><Icon name="video" /><strong>Socket events ready</strong><p>The backend has join-room and leave-room events.</p></div>
        </div>
      </article>

      <article className="panel room-chat-panel">
        <PanelHeading title="Room chat" subtitle="Persistent meeting collaboration messages" />
        {chatError && <div className="form-message error">{chatError}</div>}
        <div className="chat-list">
          {messages.map((message, index) => {
            const sender = typeof message.sender === 'string' ? null : message.sender
            return (
              <div className="chat-message" key={message._id || index}>
                <span className="avatar small">{initials(sender?.username || 'U')}</span>
                <div>
                  <strong>{sender?.username || 'User'}</strong>
                  <p>{message.message}</p>
                  <small>{new Date(message.createdAt).toLocaleString()}</small>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && <div className="mini-empty">No messages yet. Start the discussion.</div>}
        </div>
        <form className="chat-form" onSubmit={sendChatMessage}>
          <input name="message" placeholder="Type a room message..." />
          <button className="primary-button">Send</button>
        </form>
      </article>
    </section>
  )
}

function TeamsView({ teams, invitations, onCreate, onInvite, onAccept }: { teams: Team[]; invitations: TeamInvitation[]; onCreate: () => void; onInvite: (team: Team) => void; onAccept: (teamId: string) => void }) {
  return (
    <section>
      <PageHeading eyebrow="People and permissions" title="Teams" text="Group collaborators, manage members, and keep work organized.">
        <button className="primary-button" onClick={onCreate}><Icon name="plus" size={18} />Create team</button>
      </PageHeading>

      {invitations.length > 0 && (
        <div className="invitation-banner">
          <span><Icon name="email" /></span>
          <div><strong>You have {invitations.length} pending invitation{invitations.length === 1 ? '' : 's'}</strong><p>Join a team to start collaborating with its members.</p></div>
          <div className="banner-invites">
            {invitations.map((invite) => <button key={invite.teamId} onClick={() => onAccept(invite.teamId)}>Accept {invite.teamName}</button>)}
          </div>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="panel page-empty"><EmptyState icon="team" title="No teams yet" text="Create a team, then invite registered users by email." action="Create your first team" onAction={onCreate} /></div>
      ) : (
        <div className="cards-grid team-cards">
          {teams.map((team, index) => (
            <article className="resource-card team-card" key={team._id}>
              <div className="resource-card-top">
                <span className={`team-logo large team-${index % 3}`}>{initials(team.name)}</span>
                <button className="more-button" aria-label={`More options for ${team.name}`}>•••</button>
              </div>
              <h2>{team.name}</h2>
              <p>{team.description || 'A shared workspace for your team.'}</p>
              <div className="member-block">
                <div className="avatar-stack large-stack">
                  {[0, 1, 2, 3].slice(0, Math.min(peopleCount(team.members), 4)).map((number) => <span key={number}>{number + 1}</span>)}
                </div>
                <small>{peopleCount(team.members)} member{peopleCount(team.members) === 1 ? '' : 's'}</small>
              </div>
              <div className="resource-actions">
                <button className="secondary-button small-button" onClick={() => onInvite(team)}><Icon name="plus" size={16} />Invite member</button>
                <button className="text-link">View team<Icon name="arrow" size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function MeetingsView({
  meetings,
  onCreate,
  onUpdate,
}: {
  meetings: Meeting[]
  onCreate: () => void
  onUpdate: (meeting: Meeting, status: Meeting['status']) => void
}) {
  return (
    <section>
      <PageHeading eyebrow="Video and collaboration" title="Meetings" text="Schedule meetings, move them live, and keep post-meeting history.">
        <button className="primary-button" onClick={onCreate}><Icon name="plus" size={18} />Schedule meeting</button>
      </PageHeading>
      {meetings.length === 0 ? (
        <div className="panel page-empty"><EmptyState icon="calendar" title="No meetings yet" text="Schedule your first meeting and IntellMeet will create a room code for it." action="Schedule meeting" onAction={onCreate} /></div>
      ) : (
        <div className="cards-grid">
          {meetings.map((meeting) => (
            <article className="resource-card" key={meeting._id}>
              <div className="resource-card-top">
                <span className="room-art"><Icon name="calendar" size={24} /></span>
                <span className="status-pill"><span /> {meeting.status}</span>
              </div>
              <h2>{meeting.title}</h2>
              <p>{meeting.description || 'Meeting agenda and discussion will be tracked here.'}</p>
              <div className="resource-meta">
                <span><Icon name="clock" size={15} />{new Date(meeting.startTime).toLocaleString()}</span>
                <span><Icon name="door" size={15} />{meeting.roomId}</span>
              </div>
              <div className="resource-actions">
                <button className="secondary-button small-button" onClick={() => onUpdate(meeting, 'live')}>Go live</button>
                <button className="primary-button small-button" onClick={() => onUpdate(meeting, 'completed')}>Complete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function TasksView({
  tasks,
  onCreate,
  onMove,
}: {
  tasks: Task[]
  onCreate: () => void
  onMove: (task: Task, status: Task['status']) => void
}) {
  const columns: Array<{ id: Task['status']; label: string }> = [
    { id: 'todo', label: 'Todo' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' },
  ]

  return (
    <section>
      <PageHeading eyebrow="Kanban board" title="Tasks" text="Convert meeting outcomes into tracked action items.">
        <button className="primary-button" onClick={onCreate}><Icon name="plus" size={18} />Add task</button>
      </PageHeading>
      <div className="kanban-grid">
        {columns.map((column) => (
          <div className="panel kanban-column" key={column.id}>
            <PanelHeading title={column.label} subtitle={`${tasks.filter((task) => task.status === column.id).length} tasks`} />
            <div className="kanban-list">
              {tasks.filter((task) => task.status === column.id).map((task) => (
                <article className="task-card" key={task._id}>
                  <span className={`priority ${task.priority}`}>{task.priority}</span>
                  <h3>{task.title}</h3>
                  <p>{task.description || 'No description added.'}</p>
                  {task.dueDate && <small><Icon name="calendar" size={13} />{new Date(task.dueDate).toLocaleDateString()}</small>}
                  <div className="task-moves">
                    {columns.filter((item) => item.id !== task.status).slice(0, 2).map((item) => (
                      <button key={item.id} onClick={() => onMove(task, item.id)}>{item.label}</button>
                    ))}
                  </div>
                </article>
              ))}
              {tasks.filter((task) => task.status === column.id).length === 0 && (
                <div className="mini-empty">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SummariesView({
  meetings,
  summaries,
  onCreate,
}: {
  meetings: Meeting[]
  summaries: MeetingSummary[]
  onCreate: () => void
}) {
  return (
    <section>
      <PageHeading eyebrow="AI meeting intelligence" title="Notes and summaries" text="Generate local AI-style summaries and action items from meeting notes.">
        <button className="primary-button" onClick={onCreate} disabled={meetings.length === 0}><Icon name="plus" size={18} />Generate summary</button>
      </PageHeading>
      {summaries.length === 0 ? (
        <div className="panel page-empty"><EmptyState icon="email" title="No summaries yet" text="Create a meeting, add notes, then generate a summary and action items." action="Generate summary" onAction={onCreate} /></div>
      ) : (
        <div className="cards-grid">
          {summaries.map((summary) => {
            const meeting = typeof summary.meeting === 'string' ? null : summary.meeting
            return (
              <article className="resource-card summary-card" key={summary._id}>
                <div className="resource-card-top">
                  <span className="room-art"><Icon name="email" size={24} /></span>
                  <span className="status-pill"><span /> {summary.generatedBy}</span>
                </div>
                <h2>{meeting?.title || 'Meeting summary'}</h2>
                <p>{summary.summary}</p>
                <div className="summary-actions">
                  {summary.actionItems.slice(0, 4).map((item) => (
                    <span key={item._id || item.text}><Icon name="check" size={13} />{item.text}</span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function AnalyticsView({
  analytics,
  notifications,
}: {
  analytics: Analytics | null
  notifications: Notification[]
}) {
  return (
    <section>
      <PageHeading eyebrow="Insights and notifications" title="Analytics" text="Track meetings, tasks, notifications, and productivity progress." />
      <section className="stats-grid">
        <StatCard label="Meetings" value={analytics?.totals.meetings || 0} detail="Total accessible meetings" icon="calendar" tone="violet" />
        <StatCard label="Tasks" value={analytics?.totals.tasks || 0} detail="Assigned and created tasks" icon="check" tone="blue" />
        <StatCard label="Messages" value={analytics?.totals.messages || 0} detail="Room chat messages" icon="email" tone="amber" />
        <StatCard label="Productivity" value={`${analytics?.productivityScore || 0}%`} detail="Tasks completed" icon="clock" tone="green" />
      </section>
      <div className="dashboard-grid">
        <article className="panel">
          <PanelHeading title="Task distribution" subtitle="Kanban status counts" />
          <div className="metric-list">
            {Object.entries(analytics?.taskStatus || {}).map(([status, count]) => (
              <div key={status}><span>{status}</span><strong>{count}</strong></div>
            ))}
          </div>
        </article>
        <article className="panel">
          <PanelHeading title="Notifications" subtitle={`${notifications.filter((item) => !item.read).length} unread`} />
          <div className="notification-list">
            {notifications.slice(0, 8).map((item) => (
              <div className="notification-row" key={item._id}>
                <span className={`room-icon tone-${item.read ? 2 : 0}`}><Icon name="bell" size={16} /></span>
                <span><strong>{item.title}</strong><small>{item.message}</small></span>
              </div>
            ))}
            {notifications.length === 0 && <div className="mini-empty">No notifications yet</div>}
          </div>
        </article>
      </div>
    </section>
  )
}

function ProfileView({ user, rooms, teams }: { user: User; rooms: Room[]; teams: Team[] }) {
  return (
    <section>
      <PageHeading eyebrow="Account" title="My profile" text="Your identity and workspace activity." />
      <div className="profile-layout">
        <article className="panel profile-card">
          <div className="profile-cover" />
          <span className="avatar profile-avatar">{initials(user.username)}</span>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
          <span className="verified-badge"><Icon name="check" size={14} />Verified account</span>
          <div className="profile-stats">
            <div><strong>{rooms.length}</strong><small>Rooms</small></div>
            <div><strong>{teams.length}</strong><small>Teams</small></div>
            <div><strong>{user.role}</strong><small>Role</small></div>
          </div>
        </article>
        <article className="panel account-details">
          <PanelHeading title="Account details" subtitle="Your personal information" />
          <div className="detail-grid">
            <div><span>Full name</span><strong>{user.username}</strong></div>
            <div><span>Email address</span><strong>{user.email}</strong></div>
            <div><span>Account role</span><strong>{user.role}</strong></div>
            <div><span>Email status</span><strong>{user.verified ? 'Verified' : 'Pending'}</strong></div>
          </div>
          <button className="secondary-button">Edit profile</button>
        </article>
      </div>
    </section>
  )
}

function PageHeading({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>
      {children && <div className="page-heading-actions">{children}</div>}
    </div>
  )
}

function ActionModal({
  modal,
  selectedTeam,
  meetings,
  teams,
  onClose,
  onComplete,
}: {
  modal: Exclude<Modal, null>
  selectedTeam: Team | null
  meetings: Meeting[]
  teams: Team[]
  onClose: () => void
  onComplete: (message: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const content = {
    'create-room': { icon: 'video' as IconName, title: 'Create a room', text: 'Give your new collaboration space a name and code.' },
    'join-room': { icon: 'door' as IconName, title: 'Join a room', text: 'Enter the room code shared by the host.' },
    'create-team': { icon: 'team' as IconName, title: 'Create a team', text: 'Build a home for your group and invite members.' },
    invite: { icon: 'email' as IconName, title: `Invite to ${selectedTeam?.name || 'team'}`, text: 'The user must already have an IntellMeet account.' },
    'create-meeting': { icon: 'calendar' as IconName, title: 'Schedule meeting', text: 'Create a meeting with a matching collaboration room.' },
    'create-task': { icon: 'check' as IconName, title: 'Create task', text: 'Add a Kanban action item for your team.' },
    'create-summary': { icon: 'email' as IconName, title: 'Generate AI summary', text: 'Paste notes or transcript text and generate summary plus action items.' },
  }[modal]

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      let message = ''
      if (modal === 'create-room') {
        const result = await api.createRoom({ roomName: String(form.get('roomName')), roomId: String(form.get('roomId')) })
        message = result.message
      }
      if (modal === 'join-room') {
        const result = await api.joinRoom(String(form.get('roomId')))
        message = result.message
      }
      if (modal === 'create-team') {
        const result = await api.createTeam({ name: String(form.get('name')), description: String(form.get('description')) })
        message = result.message
      }
      if (modal === 'invite' && selectedTeam) {
        const result = await api.inviteMember(selectedTeam._id, String(form.get('email')))
        message = result.message
      }
      if (modal === 'create-meeting') {
        const result = await api.createMeeting({
          title: String(form.get('title')),
          description: String(form.get('description')),
          roomId: String(form.get('roomId')),
          startTime: String(form.get('startTime')),
        })
        message = result.message
      }
      if (modal === 'create-task') {
        const result = await api.createTask({
          title: String(form.get('title')),
          description: String(form.get('description')),
          status: 'todo',
          priority: String(form.get('priority')) as Task['priority'],
          dueDate: String(form.get('dueDate')) || undefined,
          team: String(form.get('team')) || undefined,
        })
        message = result.message
      }
      if (modal === 'create-summary') {
        const result = await api.saveSummary(String(form.get('meeting')), {
          notes: String(form.get('notes')),
          transcript: String(form.get('transcript')),
          generate: true,
          createTasks: Boolean(form.get('createTasks')),
        })
        message = result.message
      }
      await onComplete(message)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <span className="modal-icon"><Icon name={content.icon} /></span>
        <h2 id="modal-title">{content.title}</h2>
        <p>{content.text}</p>
        {error && <div className="form-message error">{error}</div>}
        <form onSubmit={submit}>
          {modal === 'create-room' && <>
            <Field icon="video" label="Room name" name="roomName" placeholder="Weekly product sync" />
            <Field icon="lock" label="Room code" name="roomId" placeholder="product-sync-24" />
          </>}
          {modal === 'join-room' && <Field icon="lock" label="Room code" name="roomId" placeholder="Enter room code" />}
          {modal === 'create-team' && <>
            <Field icon="team" label="Team name" name="name" placeholder="Product design" />
            <label className="field"><span className="field-label">Description</span><textarea name="description" placeholder="What does this team work on?" maxLength={500} /></label>
          </>}
          {modal === 'invite' && <Field icon="email" label="Member email" name="email" type="email" placeholder="teammate@company.com" />}
          {modal === 'create-meeting' && <>
            <Field icon="calendar" label="Meeting title" name="title" placeholder="Sprint planning" />
            <Field icon="door" label="Room code" name="roomId" placeholder="sprint-planning" />
            <Field icon="clock" label="Start time" name="startTime" type="datetime-local" />
            <label className="field"><span className="field-label">Description</span><textarea name="description" placeholder="Agenda, goals, participants..." maxLength={1000} /></label>
          </>}
          {modal === 'create-task' && <>
            <Field icon="check" label="Task title" name="title" placeholder="Prepare meeting report" />
            <label className="field"><span className="field-label">Description</span><textarea name="description" placeholder="Describe the work to be done" maxLength={1000} /></label>
            <label className="field"><span className="field-label">Priority</span><select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            <label className="field"><span className="field-label">Team</span><select name="team" defaultValue=""><option value="">No team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>
            <Field icon="calendar" label="Due date" name="dueDate" type="date" required={false} />
          </>}
          {modal === 'create-summary' && <>
            <label className="field"><span className="field-label">Meeting</span><select name="meeting" required>{meetings.map((meeting) => <option key={meeting._id} value={meeting._id}>{meeting.title}</option>)}</select></label>
            <label className="field"><span className="field-label">Meeting notes</span><textarea name="notes" placeholder="Paste notes, decisions, and follow-up points" required /></label>
            <label className="field"><span className="field-label">Transcript</span><textarea name="transcript" placeholder="Optional transcript text" /></label>
            <label className="check-label"><input name="createTasks" type="checkbox" /><span>Create tasks from action items</span></label>
          </>}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={loading}>{loading ? <span className="button-spinner" /> : 'Continue'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
