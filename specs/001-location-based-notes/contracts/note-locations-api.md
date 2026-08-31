# Note-Locations API Contract

Base route: `/api/notes`. All timestamps use ISO 8601 UTC strings. The API is single-user and unauthenticated in this version.

## Shapes

```ts
type NoteLocation = {
  id: string; // GUID
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId: string | null; // GUID
  isArchived: boolean;
  childCount: number;
  createdAt: string;
  updatedAt: string;
};

type NoteLocationInput = {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  parentId?: string | null; // GUID
  isArchived?: boolean;
};

type SearchResult = NoteLocation & {
  ancestors: Array<{ id: string; title: string }>;
};
```

## Operations

| Method | Route | Request | Success | Failures |
|---|---|---|---|---|
| GET | `/api/notes` | Optional `search`; optional `parentId` | 200, `NoteLocation[]` | 400 for invalid query values |
| GET | `/api/notes/{id}` | None | 200, `NoteLocation` | 404 when absent |
| POST | `/api/notes` | `NoteLocationInput` | 201, `NoteLocation` | 400 for invalid fields or unknown parent |
| PUT | `/api/notes/{id}` | `NoteLocationInput` without a changed `parentId` | 204 | 400 for invalid fields, parent change, or forbidden archive transition; 404 when absent |
| DELETE | `/api/notes/{id}` | None | 204 | 400 if active or has children; 404 when absent |
| GET | `/api/notes/search?term={term}` | Search term | 200, `SearchResult[]` | 400 for invalid query values |

## Behavior Rules

- `GET /api/notes` without `parentId` returns root locations. With a GUID `parentId`, it returns direct children only. The implementation may use a separate hierarchy read internally, but the external result is always a flat collection of direct nodes.
- `search` and `term` match title and description using literal user input; wildcard and escape characters are treated as text, not query syntax.
- `POST` accepts `parentId` only when it is a valid GUID referencing an existing location; omission or `null` creates a root.
- `PUT` preserves the stored `parentId`. Sending a different parent is rejected.
- A transition from active to archived is accepted only when `childCount` is zero. A transition from archived to active is accepted only through `PUT`.
- `DELETE` is accepted only for an archived location with `childCount` equal to zero.
- Input validation rejects blank titles, descriptions longer than 20,000 characters, and coordinates outside their geographic ranges.