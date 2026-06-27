# LPU MISD Helpdesk

LPU MISD Helpdesk is a ticketing and support application for MISD service requests. It includes a React/Vite frontend, an Express API, Supabase-backed data/auth flows, ticket chat, admin management, analytics, knowledge base features, and an optional AI chatbot.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Express 4
- Supabase
- Docker / Docker Compose

## Repository Structure

```text
.
|-- backend/              # Express API, routes, services, Supabase setup
|-- public/               # Static frontend assets
|-- src/                  # React application
|-- Dockerfile            # Multi-stage production image
|-- docker-compose.yml    # Single-service app deployment
|-- package.json          # Frontend scripts/dependencies
`-- .env.example          # Root environment template
```

## Prerequisites

- Node.js 20 or newer
- npm
- Docker and Docker Compose
- Supabase project
- Supabase SQL schema from [backend/schema.sql](backend/schema.sql) applied once

## Environment Variables

Required values:

```env
PUBLIC_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
```

Optional values:

```env
VITE_PUBLIC_BASE_URL=
VITE_API_BASE_URL_PROD=/
VITE_API_BASE_URL_LOCAL=http://localhost:5000
CORS_ORIGINS=
MAGIC_LINK_ALLOWED_DOMAINS=@lpulaguna.edu.ph,@lpusc.edu.ph
ADMIN_SEED_FULL_NAME=System Admin
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
GEMINI_API_KEY=
GROQ_API_KEY=
```

Notes:

- Use one `.env` file in the repository root for local development.
- Docker Compose passes values through the service `environment` block.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are browser-visible public values.
- `PUBLIC_BASE_URL` should be the deployed app origin, for example `https://helpdesk.example.edu`. It is used for Supabase email redirect buttons.
- `VITE_PUBLIC_BASE_URL` is optional. Leave it blank to reuse `PUBLIC_BASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are backend-only secrets.
- `GEMINI_API_KEY` and `GROQ_API_KEY` are only needed for AI/chatbot features.
- Admin invitation email is sent by Supabase Auth using the Supabase project's configured email provider.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the contents of [backend/schema.sql](backend/schema.sql).
4. For local development, copy the project URL, anon key, and service role key into the root `.env` file.
5. Configure Supabase Auth email settings if admin invitations or magic-link login are used. Set the Site URL to your deployed `PUBLIC_BASE_URL` and add these redirect URLs:
   - `${PUBLIC_BASE_URL}/auth/callback`
   - `${PUBLIC_BASE_URL}/admin/verify-email`

## Local Development

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create the root environment file:

```bash
cp .env.example .env
```

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Docker

The Docker image is a single production image. The frontend is built in a temporary stage, backend production dependencies are installed in a separate stage, and the final container runs Express as the non-root `node` user. Express serves both the API and the compiled frontend.

Runtime environment values are not baked into the image. Browser runtime config is served dynamically from `/env.js`.

Docker Compose passes runtime values through the service `environment` block.

Build the image:

```bash
docker compose build
```

Run locally with Docker Compose:

```bash
docker compose up -d
```

Default Docker URLs:

- App: `http://localhost:5000`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

Stop the app:

```bash
docker compose down
```

## Publishing

The Compose file tags the image as:

```text
eaglestelle/lpul-misd-helpdesk:latest
```

Build and push:

```bash
docker compose build
docker push eaglestelle/lpul-misd-helpdesk:latest
```

## Server Deployment

On the server, create a deployment directory and place `docker-compose.yml` in it.

Use this Docker Compose setup:

```yaml
services:
  lpul-misd-helpdesk:
    image: eaglestelle/lpul-misd-helpdesk:latest
    environment:
      PUBLIC_BASE_URL: http://localhost:5000
      VITE_PUBLIC_BASE_URL: ""
      VITE_API_BASE_URL_PROD: /
      VITE_API_BASE_URL_LOCAL: http://localhost:5000
      CORS_ORIGINS: ""
      VITE_SUPABASE_URL: ""
      VITE_SUPABASE_ANON_KEY: ""
      SUPABASE_SERVICE_ROLE_KEY: ""
      JWT_SECRET: ""
      MAGIC_LINK_ALLOWED_DOMAINS: "@lpulaguna.edu.ph,@lpusc.edu.ph"
      ADMIN_SEED_FULL_NAME: System Admin
      ADMIN_SEED_EMAIL: ""
      ADMIN_SEED_PASSWORD: ""
      GEMINI_API_KEY: ""
      GROQ_API_KEY: ""
    ports:
      - "5000:5000"
    restart: unless-stopped
```

Fill in production values directly in the `environment` block and keep `docker-compose.yml` private because it contains backend secrets.

Pull and start the published image:

```bash
docker compose pull
docker compose up -d
```

View logs:

```bash
docker compose logs -f lpul-misd-helpdesk
```

Update to a newer image:

```bash
docker compose pull
docker compose up -d
```

Do not use `docker compose up --build` on a server that only has the deployment `docker-compose.yml`; building requires the full repository.

## Scripts

Frontend scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend scripts:

```bash
cd backend
npm start
npm run dev
```

## Verification

Before handing off or deploying changes:

```bash
npm run lint
npm run build
docker compose config --quiet
docker compose build
```

Optional dependency checks:

```bash
npm audit --omit=dev
cd backend
npm audit --omit=dev
```

## Troubleshooting

If the backend fails on startup, confirm that:

- `SUPABASE_SERVICE_ROLE_KEY` is set.
- `JWT_SECRET` is set.
- `backend/schema.sql` has been applied to Supabase.
- Supabase Auth email settings are configured if invitation or magic-link email is used.

If the frontend cannot connect to the API in Docker, confirm that:

- The app is opened through `http://localhost:5000`.
- Requests use same-origin `/api`.
- `/env.js` returns the expected public Supabase values.

If Supabase email buttons redirect to localhost after deployment, confirm that:

- `PUBLIC_BASE_URL` is set to the deployed app origin in Docker Compose.
- Supabase Auth Site URL and Redirect URLs use the deployed app origin.
- A fresh invitation or magic link was sent after updating the deployment config.

If chatbot or AI features fail, confirm that the required provider keys are configured:

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
