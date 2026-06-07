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
