# Python Worker Plan

## Goal

Keep the main application backend in Go while making Python the execution runtime for:

- scraping and browser automation
- AI and agentic flows
- media and file transformations
- recurring jobs and long-running tasks

## Split

Go remains the control plane:

- authentication and sessions
- workspaces and tenant boundaries
- plans, billing, quotas, and API keys
- job creation, scheduling metadata, and admin APIs

Python becomes the execution plane:

- tool registry
- worker health and readiness
- run execution
- future schedulers and queue consumers

## Current Scaffold

The worker now exposes:

- `GET /health`
- `GET /tools`
- `POST /runs/preview`

That is enough to:

- validate the service boundary locally
- start Chrome/HTTP-based smoke tests
- evolve toward real job claiming later without blocking the frontend rebrand

## Next Integration Step

The next practical step is for the Go API to persist tool runs and forward execution requests to the worker, either through:

1. direct HTTP dispatch for early development
2. Postgres-backed job claiming
3. Redis or another queue once worker pressure makes that necessary
