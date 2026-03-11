# BrokeStack Worker

This service is the Python execution layer for BrokeStack.

It is intentionally small right now:

- exposes a health endpoint
- publishes a starter tool catalog
- accepts preview run requests
- gives the Go API a clean boundary for future job dispatch

Run it locally with:

```bash
python -m pip install -e .
python -m uvicorn brokestack_worker.main:app --reload --host 127.0.0.1 --port 8091
```
