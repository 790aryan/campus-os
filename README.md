# Campus Club Event Platform

Production-ready MERN portfolio project for college club events with role-based access, student verification, event registration, auto-expiry, Cloudinary uploads, and OpenAI-powered recommendations.

## Folder Structure

```text
EVENT MANAGER/
  package.json
  client/
    React + Vite + Tailwind frontend
  server/
    Node + Express + MongoDB backend
```

## Setup Commands

```bash
npm run install:all
copy server\.env.example server\.env
npm run dev
```

## Environment Variables

Create `server/.env` from `server/.env.example` and fill MongoDB Atlas, JWT, Cloudinary, and OpenAI values.

## Seed Database

```bash
npm run seed --prefix server
```

Seed users:

- Super admin: `admin@campus.test` / `Admin@12345`
- Club admin: `codingclub@campus.test` / `Club@12345`
- Student: `student@campus.test` / `Student@12345`

## Deployment

1. MongoDB Atlas: create a cluster, database user, network access rule, and paste the connection string into `MONGODB_URI`.
2. Backend: deploy `server` to Render/Railway/Fly.io. Set all environment variables. Build command: `npm install`. Start command: `npm start`.
3. Frontend: deploy `client` to Vercel/Netlify. Set `VITE_API_URL` to the hosted backend URL plus `/api`.
4. Cloudinary: create an unsigned or signed upload-enabled cloud and set credentials on the backend.
5. OpenAI: set `OPENAI_API_KEY`. The app falls back to deterministic recommendations if OpenAI is unavailable.

## Cron Job

The backend starts `node-cron` automatically. It archives expired events every 15 minutes using the server timezone and UTC date comparisons in MongoDB.

## Final Run

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:5000/api`
