# Memofi

> Workspace and API platform for automation, scraping, AI agents, and practical utility tools

Memofi is a multi-tenant SaaS product for bundling useful APIs, automations, browser-driven workflows, and AI-assisted tools into one workspace. Customers can run tools from the UI, call them through the API, and manage usage inside shared workspaces. Staff get the usual admin surface for support, billing, maintenance, and troubleshooting.

The product is intentionally pragmatic:

- Go handles the core SaaS control plane: auth, tenants, sessions, admin, plans, and APIs.
- Python handles execution workloads: scraping, browser automation, agentic flows, scheduled jobs, and long-running tool runners.
- React powers the customer workspace, marketing site, and operator/admin dashboards.

## Current Direction

Memofi is evolving into a toolbox platform rather than a single-purpose app. Example tool categories include:

- Image and asset utilities such as logo generation and PNG-to-SVG conversion
- Domain and naming tools such as available domain discovery
- Automation and scraping workflows
- AI and agent-assisted utilities
- Workspace-scoped APIs that customers can call directly

## Tech Stack

### Backend

- Go 1.25
- Fiber v3
- Bun ORM with PostgreSQL
- Multi-tenant IAM, workspace, and admin APIs

### Worker Runtime

- Python 3.11+
- FastAPI-based worker control surface
- Async tool registry for long-running and scheduled execution

### Frontend

- React 19
- Vite 6
- Tailwind CSS 4
- shadcn/ui
- React Router 7
- Biome

## Project Structure

```text
brokestack/
├── apps/
│   ├── api/                     # Go control-plane API
│   ├── web/                     # React app, dashboard, admin, marketing
│   └── worker/                  # Python execution worker for tools/jobs
├── docs/
│   └── architecture/            # Product and runtime notes
├── scripts/
└── README.md
```

## Local Development

### Prerequisites

- Go 1.25+
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

### Install

```bash
npm install
cd apps/api && go mod tidy
cd ../worker && python -m pip install -e .
```

### Run

```bash
# web + go api
npm run dev

# python worker
npm run dev:worker

# all three processes together
npm run dev:all
```

### Default URLs

- Web app: `http://localhost:5173`
- Go API: `http://localhost:8080`
- API reference: `http://localhost:8080/reference`
- Worker health: `http://localhost:8091/health`
- Worker tools: `http://localhost:8091/tools`

## Architecture

Use the Go API as the system of record and orchestration edge:

- users, sessions, tenants, workspaces
- billing, plans, quotas, API keys
- job creation, run tracking, scheduling metadata
- admin and support workflows

Use the Python worker as the execution engine:

- scraping and browser automation
- AI or agent pipelines
- file and media transformations
- long-running jobs and recurring schedules

That split keeps the existing SaaS plumbing intact while letting tool development stay fast in Python.

## Scripts

- `npm run dev` starts web + Go API
- `npm run dev:api` starts only the Go API
- `npm run dev:web` starts only the web app
- `npm run dev:worker` starts the Python worker
- `npm run dev:all` starts web + Go API + Python worker
- `npm run build` builds the web app and Go API
- `npm run lint` runs frontend checks
- `npm run typecheck` runs frontend type-checking

## Notes

- Current branding assets still use legacy filenames under `apps/web/public/branding`. The UI copy and metadata now identify the product as Memofi.
- The Python worker is scaffolded for future scheduling and tool execution, but the Go API remains the main application backend.
