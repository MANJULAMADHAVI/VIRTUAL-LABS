# JNTUA Labs

A full-stack virtual programming lab for students and faculty.

## Deployment

### Frontend (Vercel)
- Connect this repository to Vercel.
- Set the root directory to the repository root.
- Vercel will serve the single-page app defined by [index (2).html](index%20(2).html).

### Backend (Render)
- Connect the backend folder as a separate web service on Render.
- Use the provided [backend/render.yaml](backend/render.yaml) configuration.
- Add these environment variables in Render:
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - JWT_SECRET
  - OPENAI_API_KEY (optional)
  - JUDGE0_API_KEY (optional)
  - JUDGE0_ENDPOINT (optional)
  - CORS_ORIGIN = https://your-vercel-app.vercel.app
  - CLIENT_URL = https://your-vercel-app.vercel.app

## Local development
- Frontend: open [index (2).html](index%20(2).html) in a browser or serve the repo root with a static server.
- Backend: run `cd backend && npm install && npm start`
