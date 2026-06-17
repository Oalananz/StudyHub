# 🔭 Roadmap — advanced features

The core study tools are fully built and working. The features below are **scaffolded**
(the architecture supports them, but they require external services or significant
extra work, so they are intentionally left as the next steps rather than faked).

## AI features (need an LLM API key)
- **AI Quiz Generator** — upload notes/PDF → generate MCQs.
- **AI Socratic Tutor** — chatbot that asks guiding questions.
- **Lecture Summarizer** — transcript/YouTube → bullet points.

**How to add:** create an `AiController` in the backend that calls the Claude API
(`claude-opus-4-8` or `claude-haiku-4-5` for cheaper calls). Store the key in
`Anthropic__ApiKey`. Add a `/dashboard/tutor` page on the frontend that streams responses.
The flashcard model is already in place, so generated questions can be saved as cards.

## Collaboration (needs real-time infra)
- **Virtual Study Rooms** — "study with me" video/text rooms.
- **Shared Notes / Wikis** — collaborative editing.
- **Leaderboards** — compete on focus hours.

**How to add:** add SignalR (`Microsoft.AspNetCore.SignalR`) to the API for presence and
chat; use a WebRTC SFU (e.g. LiveKit) for video. The `Xp` / streak fields already exist
for leaderboards — add a `GET /api/leaderboard` endpoint ordering users by XP.

## Rich content
- **PDF Annotator** — highlight & draw on PDFs (e.g. `react-pdf` + a highlight layer).
- **Interactive Mind-Mapping** — drag-and-drop concept maps (e.g. `reactflow`).
- **Focus Mode / Site Blocker** — requires a browser extension (web pages can't block other sites).
- **The "Blurting" Tool** — a textarea that diffs against a chosen note; can reuse the Notes API.

## Already shipped ✅
Pomodoro timer + logs, time analytics, 90-day heatmap, Kanban board, spaced-repetition
flashcards (SM-2), hierarchical notes, study streaks, XP + achievement badges,
ambient soundscapes, JWT auth, Docker deployment.
