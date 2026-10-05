# Deployment

## Quick deployment

1. Push this folder to GitHub.
2. Create a Node web service on a Node-compatible host.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Set `PORT` if the host requires it.
6. Optional: set `OPENAI_API_KEY` and `OPENAI_MODEL` for a real model integration.

## Important production note

The included MVP uses a JSON file for persistence and a local upload directory so judges can run it immediately. For a multi-user production deployment, replace these with managed PostgreSQL and object storage. Do not rely on ephemeral local disk for production data.
