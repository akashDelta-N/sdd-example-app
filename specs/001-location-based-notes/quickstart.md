# Quickstart: Location-Based Notes Validation

## Prerequisites

- .NET 10 SDK and pnpm are installed.
- Frontend dependencies are installed.
- Existing local flat-note data can be discarded.

## Start

1. Stop the API and delete `be/travel-note-api/notes.db` if it exists.
2. Start the API from repository root:

   ```powershell
   dotnet run --project be/travel-note-api/travel-note-api.csproj --launch-profile http
   ```

3. Start the frontend in another terminal:

   ```powershell
   pnpm --dir fe/travel-notes-app start
   ```

4. Open `http://localhost:4200`.

## End-to-End Checks

1. In add mode, click Japan with no selected parent, add its title, and save; confirm a root pin appears.
2. Select Japan, add Tokyo as its child, then add optional Tokyo content; confirm the breadcrumb is Japan > Tokyo.
3. Create two children with the same title beneath different parents; search for that title and confirm both paths distinguish them.
4. Move a child to a new parent; confirm its full subtree follows it and cycles are blocked.
5. Try to archive a parent with active children; confirm the action is rejected. Archive a leaf and confirm it is greyed out in the tree/list and absent from the map.
6. Delete the archived leaf and confirm its pin, title, and written content are gone.

## Automated Checks

```powershell
pnpm --dir fe/travel-notes-app exec ng test --no-watch
pnpm --dir fe/travel-notes-app build
dotnet build be/travel-note-api/travel-note-api.csproj
```