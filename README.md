# 📚 Study Hub

A full-stack study platform with a Pomodoro timer, session logs, flashcards (spaced repetition), a Kanban board, notes, analytics, streaks, gamification, and ambient soundscapes.

- **Backend:** ASP.NET Core 8 Web API (C#)
- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind, Framer Motion)
- **Database:** PostgreSQL (Entity Framework Core)

---

## 🚀 Quick start (Docker — recommended)

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
docker compose up --build
```

Then open:

- Frontend → http://localhost:3000
- API + Swagger → http://localhost:5080/swagger

The database is created and migrated automatically on first run. Create an account on the
register page and start studying.

To stop: `Ctrl+C`, then `docker compose down` (add `-v` to also wipe the database volume).

---

## 🧑‍💻 Local development (without Docker)

### 1. PostgreSQL
Have a Postgres 15+ instance running. Default connection used by the API:

```
Host=localhost;Port=5432;Database=studyhub;Username=studyhub;Password=studyhub
```

Override via the `ConnectionStrings__Default` environment variable or `appsettings.Development.json`.

### 2. Backend
```bash
cd backend/StudyHub.Api
dotnet restore
dotnet run
```
API runs on http://localhost:5080. Migrations are applied automatically at startup.

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at the API
npm install
npm run dev
```
Frontend runs on http://localhost:3000.

---

## ✨ Features

| Area | Feature | Status |
|------|---------|--------|
| Focus | Pomodoro timer (configurable work/break) | ✅ |
| Focus | Session logging + time analytics per subject | ✅ |
| Focus | Ambient soundscapes (rain, lo-fi, white noise, café) | ✅ |
| Productivity | Kanban task board (To do / Doing / Done) | ✅ |
| Learning | Flashcard decks with SM-2 spaced repetition | ✅ |
| Learning | Hierarchical notes | ✅ |
| Motivation | Study streaks | ✅ |
| Motivation | Achievement badges + XP | ✅ |
| Tracking | Dashboard analytics (focus hours, heatmap) | ✅ |
| AI | Quiz generator / Socratic tutor | 🔜 scaffolded |
| Collab | Live study rooms (WebRTC) | 🔜 scaffolded |

See `ROADMAP.md` for how the scaffolded features are wired.

---

## 🏗️ Project structure

```
study/
├── docker-compose.yml
├── backend/
│   └── StudyHub.Api/        # ASP.NET Core 8 Web API
│       ├── Controllers/
│       ├── Models/
│       ├── Data/
│       ├── Services/
│       └── DTOs/
└── frontend/                # Next.js 14 app
    ├── app/
    ├── components/
    └── lib/
```

## 🔐 Environment variables

| Variable | Where | Default |
|----------|-------|---------|
| `ConnectionStrings__Default` | API | local postgres |
| `Jwt__Key` | API | dev key (change in prod!) |
| `NEXT_PUBLIC_API_URL` | Frontend | http://localhost:5080 |

**In production, set a strong `Jwt__Key` (32+ chars) and real DB credentials.**
