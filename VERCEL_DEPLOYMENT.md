# Deploy to Vercel

Deploy the frontend and FastAPI backend as two Vercel projects linked to this same repository. This avoids relying on Vercel's Beta Services feature.

## Deploy

1. Create the backend Vercel project from the repository and set its **Root Directory** to `backend`. Keep the detected FastAPI settings. Add the backend variables below, then deploy. Its health endpoint is `/health`.
2. Create a second Vercel project from the same repository and set its **Root Directory** to `PolicyLedger`. Keep the detected Vite settings. Set `VITE_API_BASE_URL` to the backend deployment origin, for example `https://your-backend.vercel.app` (no trailing slash), then deploy.
3. Set the backend's `FRONTEND_URL` to the frontend deployment origin, for example `https://your-frontend.vercel.app`.
4. For Git deployments, set the correct root directory independently in each Vercel project. The frontend's `vercel.json` provides fallback routing for React Router paths such as `/dashboard`.

## Required production configuration

- Backend `JWT_SECRET`: a long, random secret. Do not use the development default.
- Backend `DATABASE_URL`: a managed PostgreSQL connection string. The default SQLite database is not persistent across serverless invocations. The PostgreSQL driver is included in `backend/requirements.txt`.
- Backend `FRONTEND_URL`: the frontend origin, used by the API's CORS configuration.
- Frontend `VITE_API_BASE_URL`: the backend deployment origin.

Set backend `AI_API_KEY`, `AI_MODEL`, and `AI_ASSISTANT_MODULE` only if the configured assistant integration requires them.

The current policy upload implementation writes to local disk. Vercel function filesystems are ephemeral, so uploaded policy files will not be durable; configure external object storage before relying on uploads in production. Functions also have request duration and upload-size limits, so long-running document processing may need a separate worker service. For preview deployments, set `FRONTEND_URL` to the matching frontend preview origin or use a stable frontend domain.

## Local checks

```powershell
npm --prefix PolicyLedger install
npm --prefix PolicyLedger run build
```

For local API development, install `backend/requirements.txt` and run the existing Uvicorn command from `backend/README.md`. In development the frontend continues to call `http://localhost:8000`; in production it uses `VITE_API_BASE_URL`.