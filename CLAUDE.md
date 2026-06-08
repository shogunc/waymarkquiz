# Waymark Quiz

A real-time, multiplayer trivia quiz app for parties and gatherings. One **host**
runs the show on a shared screen (TV/projector); **participants** join and answer
on their own phones. The twist: every answer is a **year**, and scoring rewards
how close you get.

## Core concept

- The host's screen cycles through **question pages**: an image, a bit of trivia,
  and a question whose answer is a specific year.
- Participants get a fixed window of time to submit a year via their phone.
- When time is up, the host's screen transitions to a **standings** view, ideally
  with an animation showing rank changes (e.g. via Framer Motion).
- Repeat until all questions are done, then show final results.

## Scoring rule

Answer is scored by distance from the correct year:

```
points = max(0, 10 - abs(correctYear - guessedYear))
```

Examples (correct = 1994): 1994 → 10, 1997 → 7, 2010 → 0.

This logic is shared between client and server (used for live score previews and
authoritative scoring) and should live in `shared/` as a single source of truth.

## Audience & deployment

- Primary use case: a work party / casual gathering where the host's laptop drives
  a big screen and guests join from their own phones over the internet, via a
  short **join code**.
- Must be **hosted online** (not LAN-only) so it works across venues and networks.
- Deployed as a static site on **Netlify**, backed by **Firestore** for both
  persistence and real-time sync. This avoids needing a persistent custom server
  (which Netlify can't host) — Firestore's `onSnapshot` listeners *are* the
  real-time layer: clients subscribe to a session document and react to changes.

## Planned architecture

A single React + TypeScript + Vite + Tailwind CSS + Framer Motion app, with three
views: host display, participant (player) view, and an admin/quiz-authoring UI.
No custom backend server — clients talk directly to Firebase services:

- **Firestore** — stores quizzes, questions (including their images, see below),
  game sessions/state, and scores. Also doubles as the real-time transport: the
  host writes state changes (current question, phase, timer end-time, scores)
  to the session document; all clients subscribe via `onSnapshot` and render
  whatever phase they observe.
- **Firebase Auth** — simple shared-password (or similar) auth for the admin/
  quiz-authoring UI; anonymous auth to give each participant a stable identity
  for the duration of a session.
- **`shared/`** types/constants — game state shape, Firestore document schemas,
  and the scoring formula above, reused across the three views.

## Admin / authoring UI

CRUD on the question library and on quizzes (which assemble questions from that
library — see Quiz library below), gated behind a single shared password.
Simplest implementation: one Firebase Auth account whose credentials are shared
with anyone trusted to author content — gets Firebase Auth's session handling
for free without building custom auth or per-person accounts.

- **Question editing**: form for image, trivia text, prompt, and correct year.
  Includes a **live preview** rendered roughly as it'll appear on the host
  screen — catches readability issues (text too long, image too small/cropped
  oddly) before party night, while the content is still easy to tweak.
- **Images**: uploaded from the admin's device, **resized/compressed
  client-side (e.g. via `<canvas>`) and stored as a base64 data-URI string
  directly on the question document** — not linked by URL, and not Firebase
  Storage. This keeps quizzes self-contained (safe from source images
  disappearing between authoring and the actual event) and keeps the whole app
  on Firestore alone, avoiding Firebase Storage's requirement to be on a
  billing-enabled (Blaze) plan. The constraint this imposes: Firestore documents
  cap out at 1 MiB and base64 adds ~37% overhead, so compressed images need to
  land under roughly 700 KB raw — comfortably achievable with a resize to
  ~1000-1200px wide at moderate JPEG quality, which also has the side benefit of
  giving the host display consistently-sized images.
- **Deletion guard**: deleting a question that's referenced by one or more
  quizzes is **blocked**, with the UI listing which quizzes use it — prevents
  silently shrinking a quiz you forgot was using that question. The author
  removes it from those quizzes first, then deletes it.

### Authority model: host-authoritative

The host's browser tab is the **single writer** for game-state transitions
(advancing questions, ending the answer window, computing/advancing scores);
everyone else only reads via listeners. This keeps things simple and needs no
server-side functions. Trade-off: if the host's tab disconnects mid-game, the
session stalls — acceptable for a casual party context (no host screen means no
party either way). If this ever needs to be more robust (e.g. larger unattended
events), revisit with Cloud Functions as a trusted authority instead.

## Game flow (state machine)

Synced session phases (written to the session document, driven by the host):

`lobby → preview → answering → results → standings → (next question: preview) → … → podium → ended`

- **Lobby**: host shows the join code/QR; joined nicknames appear live on the
  host screen as people connect (builds anticipation, lets host confirm everyone
  made it in before starting).
- **Preview**: the host screen shows only the question's trivia — the image and
  prompt stay hidden and the answer window hasn't opened yet — so the host can
  read it aloud and build suspense. Participants just see a "get ready" message.
  The host then taps **reveal** to show the question and open the answer window
  at the same instant.
- **Answering**: the question (image + trivia + prompt) appears on the host
  screen *and* the answer window opens at the same instant. Participants submit
  a guess via the drill-down picker (see below); answers lock in immediately on
  final selection — no edit/resubmit. Window length is fixed per session
  (`answerDurationSeconds`, chosen by the host when starting the session — see
  Joining/starting a session below — and applied to every question in that run),
  but the round ends as soon as *either* the timer runs out *or* every
  participant has answered — whichever comes first — so a quick-fingered group
  isn't stuck waiting out the clock.
- **Results**: once the round ends, the host scores the answers, then shows the
  correct year and this question's closest guesses (top scorers for *that*
  question specifically). This is also the moment every participant gets their
  personal reveal (see below). The host then taps **continue** to move to the
  running standings.
- **Standings**: host screen shows a **top-N leaderboard** with animated rank
  changes (Framer Motion). Tied scores share the same rank — no tiebreaker.
- **Podium**: a celebratory animated reveal (e.g. countdown 3rd → 1st) rather
  than reusing the plain standings view.

**Personal reveal** — each participant seeing their own guess vs. the correct
year and points earned (or "you didn't answer in time" for no-answer, which
scores 0 — distinguished from a wrong-but-submitted guess in the messaging,
though both score 0 if far enough off) — is *not* a synced session phase. It's
a transient, participant-local state: each participant's client detects that
their own answer document has gained a `pointsEarned` value (via `onSnapshot`)
and shows the reveal locally — timed to coincide with the host's results
screen, but independent of what the host/session phase says. This keeps the
synced state machine driven by simple host taps while still giving everyone an
individual moment before the shared standings appear.

The host drives every transition (host-authoritative — see above) and writes
the resulting phase to the session document; other clients only render whatever
phase they observe — they never infer phase from their own timers. Host controls
are intentionally minimal — **start**, **reveal**, **continue** (results →
standings), and **next** (standings → next question's preview, or → podium on
the last question) — no pause/skip/back, which keeps the state machine small
and avoids sync edge cases. Natural pacing for banter between questions comes
from the host choosing when to tap through these steps.

## Joining a session

- Participants join via a short **join code** (e.g. 4-6 characters), entered
  manually or scanned via QR code linking straight to the join screen.
- **Identity**: nickname only (no avatars in v1).
- **Joining window**: lobby only — join codes stop working once the host starts
  the quiz. No mid-quiz joins, no "catching up" logic needed.
- **Reconnection**: a participant ID is persisted client-side (e.g.
  localStorage) so refreshing, locking the phone, or a Wi-Fi hiccup lets them
  rejoin under the same nickname with their score intact. This matters in
  practice — phones lock constantly at parties.

## Answering a question

Rather than typing a 4-digit year or dragging a slider (fiddly and slow on a
phone, and this is a timed/competitive context), participants pick their answer
through a **drill-down of large tap targets**:

1. Century (e.g. "1900s" / "2000s")
2. Decade within century (e.g. "90s", "00s", "10s")
3. Exact year within decade

Each step can be backed out of if they change their mind. The final tap **locks
the answer in immediately** — deliberately snappy, matching the "quick decision"
spirit of the format (no confirm step, no edit-after-submit).

The selectable range is fixed across all quizzes — **1900–2026** — so the
drill-down UI structure (number of centuries/decades) never has to vary per
quiz or question. (Bump the upper bound as years pass.)

## Quiz library

Questions are authored **independently** as a shared library; quizzes are built
by picking and ordering questions from that library (a "playlist" pattern, not
ownership) — so a question can be reused across multiple quizzes, and editing
one updates it everywhere it appears. The host then picks which quiz to run
when starting a session. Quiz length varies — the data model and UI shouldn't
assume a "typical" size; support anything from a handful of questions to dozens.

## Data model (Firestore)

**`questions/{questionId}`** — the shared library
```
{ imageData, trivia, prompt, correctYear, createdAt, updatedAt }
// imageData: base64 data-URI string (resized/compressed client-side; see Admin UI)
```

**`quizzes/{quizId}`** — an ordered playlist of question IDs from the library
```
{ title, description?, questionIds: [qId, qId, ...], createdAt, updatedAt }
```
Order is simply array order — reordering in the admin UI just rewrites this
array. To run a session, resolve `questionIds[currentQuestionIndex]` against
the library (the full ID list is known up front, so questions can be prefetched).

**`sessions/{sessionId}`** — the live document everything syncs around
```
{
  joinCode,             // short code participants enter
  hostUid,              // host's anonymous-auth UID — see Identity model below
  quizId,
  phase,                // 'lobby' | 'preview' | 'answering' | 'results' | 'standings' | 'podium' | 'ended'
                        // (see Game flow above — "personal reveal" is participant-local, not synced)
  language,             // chosen by the host at session creation; drives which strings every client renders
  answerDurationSeconds,// chosen by the host at session creation; fixed answer-window length for every question
  currentQuestionIndex,
  answerWindowEndsAt,   // timestamp; clients render their own countdown from this
  createdAt
}
```
This doc *is* the real-time sync mechanism — the host writes to it, everyone
else listens via `onSnapshot` and renders whatever `phase` they observe.

**`sessions/{sessionId}/participants/{participantId}`** — `participantId` is
the participant's anonymous-auth UID (`request.auth.uid`), not a random ID
```
{ nickname, joinedAt, totalScore }
```

**`sessions/{sessionId}/answers/{questionIndex}_{participantId}`** — flat, not
nested under participants, so the host can query "all answers for the current
question" with a single `.where()` (no collection-group query needed)
```
{ participantId, questionIndex, guessedYear, submittedAt, pointsEarned }
```

### Identity model: Anonymous Auth (drives security rules)

Hosts and participants both sign in via **Firebase Anonymous Auth** on first
visit — no accounts, no passwords, just a real `request.auth.uid` that
Firestore security rules can check directly. This replaces an earlier
random-token design (a `hostToken` + custom localStorage participant ID) with
something rules can actually verify, and gets reconnection "for free": Firebase
Auth persists the anonymous UID in the browser's local storage, so refreshing
or relaunching the app on the same device restores the same identity —
satisfying the reconnection requirement (see Joining a session) without any
custom bookkeeping.

This shapes the write-ownership rules:
- **The host's UID is stored as `hostUid`** on the session document at creation
  time. Only `request.auth.uid == resource.data.hostUid` may write `phase`,
  `currentQuestionIndex`, `answerWindowEndsAt`, `pointsEarned`, or
  `totalScore` — keeping game-state transitions and scoring authoritative.
- **A participant may only create/update `participants/{request.auth.uid}`**
  (their own document — nickname, join time) and **only create answer documents
  where `participantId == request.auth.uid`** (their own raw guess). They can
  never write `pointsEarned` or another participant's data — a tampered guess
  only hurts the guesser, but a tampered score is rejected outright.
- **`questions`/`quizzes`**: world-readable (host and participant clients need
  to render quiz content during a session), writable only by the signed-in
  admin (the shared Firebase Auth email/password account from the Admin UI
  section — distinguished from anonymous users by `request.auth.token.firebase.sign_in_provider`).

## Visual style

Clean, modern, a bit playful/game-show-like: bold colors, big legible type
(important on both a projector and small phone screens), and animation used
purposefully (rank changes, reveals, podium) rather than decoratively.

## Conventions

*(To be filled in as the project takes shape — package manager, lint/format
tooling, test commands, folder layout, etc.)*

## Status

Early planning stage — no code yet. This file describes the intended direction;
update it as real decisions are made or the design changes.
