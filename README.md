# 🐈 Schrödinger's Cat

An internal **AI gateway / LLM router**. A single OpenAI-compatible endpoint that
fans requests out to multiple upstream model providers, chosen by routing policy and
metered per API key. Think of it as a small internal OpenRouter.

> **Not intended for production use.** This is an internal prototype; run it locally
> against the in-memory store, and don't point it at real credentials or traffic.

## What it does

- **`POST /api/v1/chat/completions`** — OpenAI-compatible chat completions. Accepts
  `model`, `messages`, and an optional `provider` override; routes to the selected
  upstream and records usage.
- **`GET  /api/v1/usage`** — token and cost usage for an API key.
- **`GET  /api/v1/keys/{id}`** — inspect an API key record.
- **`GET  /api/v1/render`** — the hosted playground's HTML preview renderer.
- **`GET  /api/v1/connect/callback`** — OAuth-style provider-connect callback.
- **`POST /api/v1/session`** — exchange a playground session token.
- **`GET  /api/v1/assets`** — resolve a stored asset URL.
- **`GET  /api/v1/proxy`** — proxy a remote asset.
- **`POST /api/v1/templates/render`** — render a prompt template with variables.
- **`POST /api/v1/metrics`** — forward a metrics event to the collector.
- **`GET  /api/v1/admin/stats`** — aggregate usage stats (operator view).
- **`POST /api/accounts/provision`** — create or update an account.
- **`/api/ops/*`** — policy reload and database maintenance.

## Architecture

- **Next.js** (App Router, TypeScript) serves the HTTP surface under `app/api/**`.
- **PostgreSQL** (via `pg`) for product data — API keys, usage, users. The app runs
  against an in-memory store unless `NODE_ENV=production`, so you don't need a live
  Postgres to run it.
- A **queue consumer** (`npm run worker` → `worker/consumer.ts`) processes background
  jobs: model evaluations, prompt template syncs, and usage exports.

## Running locally

```bash
npm install
cp .env.example .env
npm run seed        # loads sample data
npm run dev         # http://localhost:4319

# in another shell, the queue consumer:
npm run worker
```

Example request:

```bash
curl -s http://localhost:4319/api/v1/chat/completions \
  -H 'authorization: Bearer sk-gw-acme-9f3c2b7d41e8aa02c6517d0b' \
  -H 'content-type: application/json' \
  -d '{"model":"gpt-router/fast","messages":[{"role":"user","content":"hi"}]}' | jq
```

## Layout

```
app/
  api/
    v1/            # gateway surface (chat, usage, keys, session, render, connect, assets)
    ops/           # operational endpoints (policy reload, db maintenance)
    accounts/      # account provisioning
lib/
  auth.ts          # bearer-key authentication
  token.ts         # playground session JWTs
  logger.ts        # request logging
  db/              # Postgres client + queries
  storage/         # asset URLs
worker/
  consumer.ts      # queue consumer entrypoint
  tasks/           # eval harness, template sync, usage export
data/              # in-memory store + prompt templates
```
