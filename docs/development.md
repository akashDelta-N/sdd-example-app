# Development

## Prerequisites

- .NET 10 SDK (backend)
- Node.js + `pnpm` (frontend) — the repo root has no `package.json`; the
  Angular project lives entirely under `fe/travel-notes-app`.

## Run the backend

From the repo root:

```powershell
dotnet run --project be/travel-note-api/travel-note-api.csproj --launch-profile http
```

- Serves at `http://localhost:5097`.
- An `https` launch profile also exists (`https://localhost:7049` +
  `http://localhost:5097`) — see `Properties/launchSettings.json`.
- OpenAPI docs are only mapped when `ASPNETCORE_ENVIRONMENT=Development`
  (default for these launch profiles), at `/openapi`.
- The SQLite file `notes.db` is created automatically on first run
  (`EnsureCreated()` — see [data-model.md](data-model.md)). Delete it to reset
  all data.

## Run the frontend

```powershell
pnpm --dir fe/travel-notes-app start
```

- Serves at `http://localhost:4200`.
- `proxy.conf.json` forwards `/api/*` requests to `http://localhost:5097`, so
  the backend must be running (see above) for the app to load data.
- On Windows PowerShell, `pnpm` needs either `--dir <path>` or a prior `cd`
  into `fe/travel-notes-app` — there's no root-level `package.json` to run
  scripts from the repo root.

## Run frontend tests

```powershell
pnpm --dir fe/travel-notes-app exec ng test --no-watch
```

(equivalently, `cd fe/travel-notes-app` then `pnpm exec ng test --no-watch`)

- Uses Vitest under the hood. The first run in a fresh checkout may hit a
  "vitest-pool worker timeout" — re-running usually succeeds.

## Backend tests

There are currently no backend test projects in the repo.

## Known gotchas

- **SQLite + `DateTimeOffset`**: SQLite cannot `ORDER BY` a `DateTimeOffset`
  column. Entities use UTC `DateTime` plus a `ValueConverter`
  (`DateTime.SpecifyKind(v, Utc)`) instead, so JSON still serializes with a
  trailing `Z`.
- **`Microsoft.OpenApi` version pin**: pinned to `2.7.5` — CVE-2026-49451
  affects `2.0.0`, and `3.x` breaks the `Microsoft.AspNetCore.OpenApi` source
  generator (`IOpenApiMediaType.Example` is readonly). Don't bump without
  re-verifying both issues are resolved upstream.
- **Vitest + signal inputs**: after imperatively setting a component input's
  value in a spec, `await fixture.whenStable()` before asserting — otherwise
  the next signal change can look unchanged to the property binding and the
  DOM won't update.
- **`ui-row`/`ui-col` `gap`**: accepts both `gap="3"` (string, from templates)
  and `[gap]="3"` (number) via a transform.
