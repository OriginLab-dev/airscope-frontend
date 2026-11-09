# AIRSCOPE Frontend

Web dashboard for **AIRSCOPE**, an air-quality monitoring project for West Bengal. It compares and visualizes AQI, PM2.5 and PM10 readings for **Kolkata**, **Howrah** and **Asansol**, using data served by the [AIRSCOPE backend](https://github.com/OriginLab-dev/airscope-backend).

**Live site:** [airscope-frontend.vercel.app](https://airscope-frontend.vercel.app)

<!-- TODO: add a screenshot or GIF of the dashboard here -->
<!-- ![AIRSCOPE dashboard](./docs/screenshot.png) -->

> AQI values are calculated by AIRSCOPE from OpenAQ data using India's CPCB methodology. They are not official CPCB readings.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Side-by-side comparison of Kolkata, Howrah and Asansol (AQI, PM2.5, PM10) |
| `/kolkata` | Detailed Kolkata readings |
| `/howrah` | Detailed Howrah readings |
| `/asansol` | Detailed Asansol readings |

## Tech Stack

| Purpose | Technology |
|---------|------------|
| Framework | Next.js 16 (App Router) |
| UI library | React 19 |
| Charts | Recharts |
| 3D graphics | three.js with React Three Fiber |
| Animation | Motion |
| Icons | Lucide React |
| Hosting | Vercel |

## Project Structure

```
airscope-frontend/
├── app/              # Routes and pages (App Router)
├── components/       # Reusable UI components
├── lib/              # Helpers and API utilities
├── .env.example      # Environment variable template
├── next.config.mjs   # Next.js config, including the /api/* proxy rewrite
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A running AIRSCOPE backend (the default Render deployment works out of the box)

### Installation

```bash
git clone https://github.com/OriginLab-dev/airscope-frontend.git
cd airscope-frontend
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint the project with ESLint |

## Backend Connection

The browser makes same-origin `/api/*` requests, and Next.js proxies them to the AIRSCOPE backend using the `AIRSCOPE_API_BASE_URL` environment variable (it defaults to the existing Render service).

To point at a different backend locally, create `.env.local`:

```bash
AIRSCOPE_API_BASE_URL=https://your-render-backend.onrender.com
```

| Variable | Description | Required |
|----------|-------------|----------|
| `AIRSCOPE_API_BASE_URL` | Base URL of the AIRSCOPE backend | No (has a default) |

> **Security:** the backend URL is not a secret, but database credentials and API keys must never be placed in this frontend project.

## Deployment

The frontend is deployed on **Vercel**.

1. Import the repository into Vercel.
2. Set `AIRSCOPE_API_BASE_URL` to your Render backend URL.
3. Deploy.

Because the Next.js rewrite keeps browser requests same-origin, Vercel preview URLs do not need to be added one by one to the backend's CORS settings. The backend's `CORS_ORIGIN` setting still restricts direct cross-origin access.

## Related Repositories

- [airscope-backend](https://github.com/OriginLab-dev/airscope-backend): Express and MySQL API, OpenAQ importer and AQI calculation

## License

<!-- TODO: add your license, e.g. MIT -->
