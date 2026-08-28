# API Reference

Base URL (dev): `http://localhost:5097` (see [development.md](development.md) for
ports/proxy). All routes are under `api/notes`. There is no authentication.

For the full machine-readable schema, run the API in Development and browse the
live OpenAPI document at `/openapi` (see `Program.cs` — `app.MapOpenApi()` is
only mapped when `ASPNETCORE_ENVIRONMENT=Development`). This page is a concise,
human-oriented summary, not a replacement for that spec.

## Endpoints

| Method | Route | Body | Success | Failure |
|---|---|---|---|---|
| GET | `/api/notes` | — | 200, `NoteDto[]` | — |
| GET | `/api/notes?search={term}` | — | 200, `NoteDto[]` filtered by title/body | — |
| GET | `/api/notes/{id}` | — | 200, `NoteDto` | 404 if not found |
| POST | `/api/notes` | `NoteInput` | 201, `NoteDto` (+ `Location` header) | 400 on validation failure |
| PUT | `/api/notes/{id}` | `NoteInput` | 204 | 404 if not found, 400 on validation failure |
| DELETE | `/api/notes/{id}` | — | 204 | 404 if not found |

Notes:
- List results are always sorted by `updatedAt` descending (most recently
  updated first).
- `search` matches (case-insensitively, for ASCII) against both `title` and
  `body` using a SQLite `LIKE`, with `%`, `_`, and `\` escaped in the user input
  first — so a literal `%` or `_` in a search term is treated literally, not as
  a wildcard.
- `Title` is trimmed server-side before being persisted on both create and update.

## Schemas

**`NoteDto`** (response shape):

```ts
{
  id: number;
  title: string;
  body: string;
  createdAt: string; // ISO 8601 UTC, e.g. "2026-08-28T12:34:56Z"
  updatedAt: string; // ISO 8601 UTC
}
```

**`NoteInput`** (request body for POST/PUT):

```ts
{
  title: string; // required, non-empty after trim, max 200 chars
  body: string;  // optional, max 20000 chars
}
```

Validation is enforced via DataAnnotations (`[Required(AllowEmptyStrings = false)]`,
`[MaxLength]`) — ASP.NET Core's automatic model validation returns 400 with a
standard `ValidationProblemDetails` body when these are violated.

## Examples

See [`../be/travel-note-api/travel-note-api.http`](../be/travel-note-api/travel-note-api.http)
for ready-to-run request examples (list, search, create, get-by-id, update,
delete, and a validation-failure case with an empty title).
