# Auth

> Last updated: 2026-07-05 — initial doc for the new JWT auth module (register, login, me)

## Overview
JWT-based authentication as a self-contained Elysia plugin mounted at `/auth`. Users register with an email and password (hashed with `Bun.password`, argon2id), log in to receive an HS256 JWT, and use that token as a Bearer header to fetch their own profile. Credentials live in an in-memory store intentionally separate from the [user module](../../src/modules/user/index.ts), designed to be swapped for a real database later.

## Endpoints
| Method | Path | Summary | Body / Params | Responses |
|--------|------|---------|---------------|-----------|
| POST | /auth/register | Register a new user | `{ name (min 1), email, password (min 8) }` | 201 `{ id, name, email }` · 409 `'Email already registered'` · 422 validation |
| POST | /auth/login | Log in and receive a JWT | `{ email, password }` | 200 `{ token, user: { id, name, email } }` · 401 `'Invalid credentials'` · 422 validation |
| GET | /auth/me | Get the current authenticated user | Header `Authorization: Bearer <token>` | 200 `{ id, name, email }` · 401 `'Unauthorized'` |

## Flow
All routes are defined in [index.ts](../../src/modules/auth/index.ts); bodies and responses are validated with the Zod schemas in [model.ts](../../src/modules/auth/model.ts); storage is [service.ts](../../src/modules/auth/service.ts).

**POST /auth/register**
1. Body validated against `register` (invalid → 422).
2. `AuthService.findByEmail` — if the email exists, 409 `'Email already registered'`.
3. Password hashed with `Bun.password.hash` (argon2id), stored via `AuthService.create`.
4. Responds 201 with the public shape (`toPublic`) — `id`, `name`, `email` only; the hash never leaves the service.

**POST /auth/login**
1. Body validated against `login` (invalid → 422).
2. Look up the user by email; unknown email → 401 `'Invalid credentials'`.
3. `Bun.password.verify` against the stored hash; mismatch → the **identical** 401 message (anti-enumeration: callers cannot tell unknown email from wrong password).
4. Sign a JWT with payload `{ sub: String(user.id) }` and respond 200 `{ token, user }`.

**GET /auth/me**
1. Require an `Authorization` header starting with `Bearer ` → otherwise 401 `'Unauthorized'`.
2. `jwt.verify` the token; invalid signature, expiry, or missing string `sub` → 401.
3. `AuthService.findById(Number(sub))`; missing user → 401. Otherwise 200 with the public user.

## Schemas
From [model.ts](../../src/modules/auth/model.ts):

- `authUser` — public user shape `{ id: number, name: string (min 1), email }`. Used for 201 register and 200 me responses, and nested in `loginResponse`.
- `register` — `{ name: min 1, email, password: min 8 }`.
- `login` — `{ email, password }` (no min length on login; length is only enforced at registration).
- `loginResponse` — `{ token: string, user: authUser }`.
- `emailTaken` / `invalidCredentials` / `unauthorized` — literal error strings for 409 / 401 / 401.

## JWT configuration
- HS256 via [`@elysiajs/jwt`](https://elysiajs.com/plugins/jwt), 7-day expiry (`exp: '7d'`), payload `{ sub: String(userId) }`.
- Secret comes from `process.env.JWT_SECRET`. A dev fallback (`'dev-secret-do-not-use-in-production'`) exists, but the module **throws at startup** when `NODE_ENV === 'production'` and `JWT_SECRET` is unset. **Deployments must set `JWT_SECRET`.**

## Examples
```bash
# Register
curl -i -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"password123"}'

# Login
curl -i -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"password123"}'

# Current user (use the token from the login response)
curl -i http://localhost:3000/auth/me \
  -H 'Authorization: Bearer <token>'
```

## Notes
- **In-memory storage**: `AuthService` keeps users in a static array with an incrementing id (`findByEmail` / `findById` / `create`). All accounts vanish on restart. It is intentionally independent of the user module's `UserService`; both are placeholders for a real DB.
- **Testing under Node**: vitest workers run under Node, where the `Bun` global does not exist, so [auth.test.ts](../../src/modules/auth/auth.test.ts) installs a minimal `Bun.password` shim (`test-hash:<password>`). Under a Bun runtime the real argon2id path is exercised.
- There is no token refresh, logout, or revocation — a token stays valid until its 7-day expiry.
- `/auth/me` reads the `Authorization` header manually inside the handler; there is no reusable auth guard/macro yet for protecting other modules' routes.
