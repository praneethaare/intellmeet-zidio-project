# IntellMeet

IntellMeet is a full-stack team collaboration platform built with React,
TypeScript, Express, MongoDB, Redis, and Socket.IO.

## Current features

- Registration, email OTP verification, login, logout, and password reset
- JWT authentication with Redis-backed sessions
- Room creation, room-code joining, and room membership
- Team creation, member invitations, invitation acceptance, and team listing
- Meeting scheduling, live/completed meeting status, and room linkage
- Persistent room chat messages with Socket.IO-ready events
- Kanban task board with priority, due date, and status movement
- Meeting notes, local AI-style summaries, and action item extraction
- Notifications for team invitations, meetings, and task assignments
- Analytics dashboard for meetings, tasks, messages, notifications, and productivity score
- Responsive React dashboard for desktop and mobile
- Swagger API documentation

## Requirement coverage

The runnable project covers the core requirements from the Zidio PDF:

| PDF area | Implemented in this project |
| --- | --- |
| Authentication and profiles | JWT auth, OTP verification, password reset, protected routes |
| Real-time meetings foundation | Meeting CRUD, room lobby, Socket.IO room events |
| Chat and collaboration | Persistent room chat and team workspace |
| AI meeting intelligence | Local summary/action-item generator without paid API keys |
| Post-meeting dashboard | Summary list and meeting history |
| Team and project management | Teams, invitations, Kanban task board |
| Analytics and insights | Dashboard metrics and notification list |
| Security basics | bcrypt, JWT, Redis sessions, helmet, CORS, rate limits |

Production topics such as Kubernetes, Prometheus/Grafana, Sentry, WebRTC media
recording, and cloud storage are documented as roadmap/production extensions
because they require deployment infrastructure or paid/external services.

## Requirements

- Node.js 20 or newer
- MongoDB
- Redis
- Gmail account with an App Password for sending OTP emails

## Run the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set the real values in `backend/.env`. The default frontend configuration
expects the backend at `http://localhost:5001`.

Backend API documentation:

```text
http://localhost:5001/api-docs
```

## Run the frontend

Open a second terminal:

```bash
cd frontend/my-app
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Verification

```bash
cd backend
npm test

cd ../frontend/my-app
npm run lint
npm run build
```

Do not commit either `.env` file or any `node_modules` directory.

## Suggested demo flow

1. Register a user.
2. Use the development OTP shown on screen if Gmail App Password is not configured.
3. Create a room and send a room chat message.
4. Schedule a meeting with a room code.
5. Create a team and task.
6. Generate an AI notes summary from meeting notes.
7. Open Analytics to show productivity and notification metrics.
