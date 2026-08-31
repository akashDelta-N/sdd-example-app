# Quickstart: Validate Location-Based Notes

## Prerequisites

- .NET 10 SDK
- Node.js and pnpm
- Internet access for OpenStreetMap tiles

## Reset Local Data

This feature changes the SQLite schema. Stop the backend, delete its local `notes.db`, and then start the backend so the application creates the new schema. See the repository [data model](../../docs/data-model.md) for the `EnsureCreated()` limitation.

## Run the Application

From the repository root:

```powershell
dotnet run --project be/travel-note-api/travel-note-api.csproj --launch-profile http
pnpm --dir fe/travel-notes-app start
```

Open `http://localhost:4200` after both processes start.

## Run Automated Tests

```powershell
dotnet test be/travel-note-api.Tests/travel-note-api.Tests.csproj
pnpm --dir fe/travel-notes-app exec ng test --no-watch
```

## End-to-End Validation

1. Create two root note-locations by selecting distinct points on the map. Verify both appear as root tree entries and map markers when no entry is selected.
2. Select one root and create a child, then select the child from both the tree and its marker. Verify the breadcrumb, detail panel, tree selection, and marker context match.
3. Create a grandchild. Verify selecting its parent shows direct-child markers, while selecting the grandchild shows only its own marker.
4. Search for a word in a nested title and then in a description. Select each result and verify its ancestors expand in the tree and its map/detail context is opened.
5. Attempt to archive and delete a location with children. Verify each action is blocked with an explanation.
6. Archive a childless item. Verify it remains selectable, visually muted, searchable, and can be restored through its edit form.
7. Archive a childless item and delete it. Verify it disappears and selection moves to the parent or becomes empty for a root.
8. Repeat the core browse, create, edit, archive, restore, delete, and search flows in a small-screen viewport. Verify map, tree, and detail stack in that order without horizontal scrolling.

Refer to [data-model.md](data-model.md) for lifecycle rules and [note-locations-api.md](contracts/note-locations-api.md) for request/response behavior.