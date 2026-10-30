# AIRSCOPE frontend

Four-page Next.js frontend for the AIRSCOPE air-quality project:

- `/` - Kolkata, Howrah, and Asansol comparison (AQI, PM2.5, PM10)
- `/kolkata` - detailed Kolkata readings
- `/howrah` - detailed Howrah readings
- `/asansol` - detailed Asansol readings

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Backend connection

The browser uses same-origin `/api/*` requests. Next.js proxies these requests to the AIRSCOPE backend using `AIRSCOPE_API_BASE_URL` (default: the existing Render service).

To override it locally, create `.env.local`:

```text
AIRSCOPE_API_BASE_URL=https://your-render-backend.onrender.com
```

This URL is not a secret. Database credentials and API keys must never be placed in this frontend project.

## Deployment preparation

For Vercel, set the `AIRSCOPE_API_BASE_URL` environment variable to the Render backend URL. The Next.js rewrite keeps browser requests same-origin, so Vercel preview URLs do not need to be added one by one to backend CORS.

Before deployment, update the Render backend to include the CORS support committed in `airscope-backend`; it remains useful for direct browser clients and restricts direct cross-origin access through `CORS_ORIGIN`.
