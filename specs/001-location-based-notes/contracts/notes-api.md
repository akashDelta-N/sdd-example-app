# Notes API Contract

Base path: `/api/notes`

All note-locations use this representation:

```json
{
  "id": 42,
  "title": "Asakusa",
  "body": "Visit Senso-ji early.",
  "latitude": 35.7148,
  "longitude": 139.7967,
  "parentId": 12,
  "isArchived": false,
  "createdAt": "2026-08-30T10:00:00Z",
  "updatedAt": "2026-08-30T10:00:00Z"
}
```

`body` may be empty. `parentId` is `null` for a root.

| Operation | Request | Success | Validation failure |
|---|---|---|---|
| List/search | `GET /api/notes?search={term}&includeArchived={true|false}` | `200` array | Search wildcard characters are treated literally. |
| Read | `GET /api/notes/{id}` | `200` item | `404` unknown id. |
| Create | `POST /api/notes` with `title`, `body`, `latitude`, `longitude`, `parentId` | `201` item | `400` blank/invalid fields, unknown or archived parent. |
| Update/move | `PUT /api/notes/{id}` with the create fields | `204` | `400` invalid fields, invalid parent, or hierarchy cycle; `404` unknown id/parent. |
| Archive | `POST /api/notes/{id}/archive` | `204` | `400` active children; `404` unknown id. |
| Delete | `DELETE /api/notes/{id}` | `204` | `400` active item or any children; `404` unknown id. |

Title search returns matching note-locations. The client constructs hierarchy paths from the returned parent relationships, so duplicate titles can be distinguished.