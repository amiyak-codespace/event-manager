## Event Manager — Initial Build

**Built:** 2026-03-05

### Description
A full-stack event management application for creating, viewing, editing, and deleting events with live attendee tracking.

### Stack
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Radix UI (shadcn-style)
- **Backend:** NestJS (Node/TypeScript) + TypeORM
- **Database:** PostgreSQL 16

### Architecture
```
event-manager/
├── api/              # NestJS REST API (port 5000)
│   └── src/
│       ├── events/
│       │   ├── controllers/events.controller.ts
│       │   ├── services/events.service.ts
│       │   ├── entities/event.entity.ts
│       │   ├── dto/{create,update}-event.dto.ts
│       │   └── events.module.ts
│       ├── health/
│       ├── app.module.ts
│       └── main.ts
├── web/              # React/Vite SPA (port 3000)
│   └── src/
│       ├── pages/EventsPage.tsx
│       ├── components/{EventCard,EventForm,EventDialog}.tsx
│       ├── components/ui/{button,badge,dialog,select,input,...}.tsx
│       ├── lib/{api,utils}.ts
│       └── types/event.ts
└── docker-compose.yml
```

### API Endpoints (prefix: /api)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/events | List all events (optional ?status= filter) |
| POST | /api/events | Create event |
| GET | /api/events/:id | Get event by id |
| PATCH | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |
| GET | /api/health | Health check |

### Features
- Create / edit / delete events
- Status: UPCOMING, ONGOING, COMPLETED, CANCELLED
- Capacity tracking with visual progress bar
- Filter events by status
- Polished card-based UI with status color coding
- SPA served via nginx with /api proxy to backend

### Services & Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: internal only (not exposed)

### Run
```bash
cd apps/event-manager
docker-compose up --build
```
