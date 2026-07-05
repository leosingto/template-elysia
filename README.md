# template-elysia

A type-safe [ElysiaJS](https://elysiajs.com) starter template on Bun, using a feature-based MVC structure.

## Getting Started

```bash
bun install
bun run dev
```

- Server: http://localhost:3000
- Health check: http://localhost:3000/health
- OpenAPI docs: http://localhost:3000/openapi

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Start with hot reload |
| `bun run start` | Start the server |
| `bun test` | Run unit tests |

## Project Structure

```
src/
├── index.ts              # Server entry: plugins + module registration
└── modules/
    └── user/
        ├── index.ts      # Controller — Elysia instance, routing & validation
        ├── service.ts    # Business logic, decoupled from HTTP
        └── model.ts      # TypeBox schemas, types, and reference models
test/                     # Unit tests via app.handle()
```

Each module follows the Elysia convention:

- **Controller** (`index.ts`) — an Elysia instance owning routes; registers models with `.model()` and references them by name (`body: 'createUser'`).
- **Service** (`service.ts`) — an abstract class with static methods; returns `status(...)` from `elysia` for errors instead of throwing.
- **Model** (`model.ts`) — exports each TypeBox schema alongside its inferred type (`typeof schema.static`).

## Adding a Module

1. Create `src/modules/<name>/` with `model.ts`, `service.ts`, `index.ts`.
2. Export an Elysia instance from `index.ts` with a `prefix` and `tags`.
3. Register it in [src/index.ts](src/index.ts) with `.use(...)`.

## Included Plugins

- [`@elysiajs/openapi`](https://elysiajs.com/plugins/openapi) — interactive API docs at `/openapi`
- [`@elysiajs/cors`](https://elysiajs.com/plugins/cors) — CORS handling
