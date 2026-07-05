# Architecture

> Last updated: 2026-07-05 — initial doc; covers app wiring including the new auth module

## Overview
Bun + ElysiaJS + Zod HTTP API template. Each feature lives in `src/modules/<name>/` as a self-contained Elysia plugin, and [src/index.ts](../src/index.ts) composes them into the exported `app`.

## App wiring (`src/index.ts`)
Plugins/routes are applied in this order:

1. `@elysiajs/cors` — CORS for all routes.
2. `@elysiajs/openapi` — OpenAPI docs at `/openapi`, with Zod schemas mapped via `z.toJSONSchema`. Tags: `App`, `User`, `Auth`.
3. `GET /health` — returns `{ status: 'ok' }` (tag `App`).
4. [`user`](../src/modules/user/index.ts) module — mounted at `/users`.
5. [`auth`](../src/modules/auth/index.ts) module — mounted at `/auth`. See [modules/auth.md](modules/auth.md).

`app` is exported for tests; the server only listens on port 3000 when the file is the entrypoint (`import.meta.main`).

## Module convention
Each module follows the same layout:

- `index.ts` — Elysia plugin with `prefix` and `tags`; routes declare `body`/`params`/`response` schemas and an OpenAPI `summary`.
- `model.ts` — Zod schemas plus inferred types; error responses are Zod string literals validated per status code.
- `service.ts` — business logic backed by an in-memory store (static class), intended to be replaced by a real database.
- `<name>.test.ts` — co-located vitest tests that exercise routes via `app.handle(new Request(...))` without a live server.

## Modules
| Module | Prefix | Doc |
|--------|--------|-----|
| user | `/users` | (no doc yet) |
| auth | `/auth` | [modules/auth.md](modules/auth.md) |

The auth module keeps its own user store (`AuthService`), separate from `UserService` — the two are not linked.

## Environment
| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | In production | HS256 signing secret. Dev fallback exists, but the app throws at startup if `NODE_ENV === 'production'` and it is unset. |
| `NODE_ENV` | No | Gates the `JWT_SECRET` production check. |

## Testing
Tests run with vitest under Node. Bun-only APIs used by routes (currently `Bun.password` in auth) are shimmed in the test file when the `Bun` global is absent; running under a Bun-powered runner uses the real implementations.
