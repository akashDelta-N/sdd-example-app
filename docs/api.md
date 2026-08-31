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
| GET | `/api/notes` | — | 200, root `NoteDto[]` | — |
| GET | `/api/notes?parentId={guid}` | — | 200, direct-child `NoteDto[]` | — |
| GET | `/api/notes/{id}` | — | 200, `NoteDto` | 404 if not found |
| GET | `/api/notes/search?term={term}` | — | 200, `SearchResultDto[]` | — |
| POST | `/api/notes` | `NoteInput` | 201, `NoteDto` (+ `Location` header) | 400 on validation failure or unknown parent |
| PUT | `/api/notes/{id}` | `NoteInput` | 204 | 404 if not found; 400 for reparenting or invalid archive transition |
| DELETE | `/api/notes/{id}` | — | 204 | 404 if not found; 400 unless archived and childless |

Notes:
- Root and child lists are always sorted by `updatedAt` descending.
- Search matches (case-insensitively, for ASCII) both `title` and `description` using a SQLite `LIKE`, with `%`, `_`, and `\` escaped so they remain literal text.
- `Title` is trimmed server-side before being persisted on both create and update.

## Schemas

**`NoteDto`** (response shape):

```ts
{
  id: string; // GUID
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId: string | null;
  isArchived: boolean;
  childCount: number;
  createdAt: string; // ISO 8601 UTC, e.g. "2026-08-28T12:34:56Z"
  updatedAt: string; // ISO 8601 UTC
}
```

**`NoteInput`** (request body for POST/PUT):

```ts
{
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId?: string | null;
  isArchived?: boolean;
}
```

`title` is required and limited to 200 characters, `description` is limited to 20,000 characters, and coordinates must be within geographic latitude/longitude bounds. The parent is immutable after creation. A location with children cannot be archived or deleted, and deletion requires a prior archive.

**`SearchResultDto`** pairs a `note` with ordered `ancestors` (`id` and `title`) so a client can expand the selected result in its tree.

## Examples

See [`../be/travel-note-api/travel-note-api.http`](../be/travel-note-api/travel-note-api.http)
for ready-to-run request examples (list, search, create, get-by-id, update,
delete, and a validation-failure case with an empty title).
