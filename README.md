# Waymark Quiz

A real-time, multiplayer trivia quiz app where every answer is a year. See
[CLAUDE.md](./CLAUDE.md) for the full design — concept, scoring, architecture,
data model, and game flow.

## Stack

Vite + React + TypeScript + Tailwind CSS + Framer Motion + Firebase
(Firestore, Auth), deployed to Netlify. Question images are stored as
compressed base64 strings directly in Firestore — no Firebase Storage.

## Getting started

```sh
npm install
cp .env.example .env.local   # fill in your Firebase project's web app config
npm run dev
```

## Deploying

Hosted as a static site on [Netlify](https://netlify.com), backed by Firestore
for persistence and real-time sync (see [CLAUDE.md](./CLAUDE.md#audience--deployment)).
`netlify.toml` defines the build (`npm run build` → `dist`) and a catch-all
redirect to `index.html` so client-side routes (`/join`, `/admin/quizzes/:id`,
etc.) work on deep links and refreshes.

To deploy:

1. Connect this repo to a new Netlify site (or run `netlify init`).
2. In the site's **Environment variables**, add the same `VITE_FIREBASE_*`
   keys from `.env.example`/`.env.local` — Vite needs them at build time.
3. Push to the connected branch (or `netlify deploy --prod`) to build and go live.

Firestore security rules (`firestore.rules`) and indexes are deployed
separately via the Firebase CLI: `firebase deploy --only firestore`.
