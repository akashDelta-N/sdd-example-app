# Implementation Plan: Location-Based Notes

**Branch**: `001-location-based-notes` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification for hierarchical travel notes with synchronized map, tree, detail, search, and leaf-only archive/delete actions.

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the flat note list with a user-defined location hierarchy. Evolve the existing note resource with GUID identity, geographic coordinates, an optional immutable parent, and archive state; expose hierarchy-aware reads and guarded lifecycle actions through the existing API controller. Replace the current frontend note slice with one signal-backed location-notes container and presentational tree, map, detail/form, and search components. Build and maintain controls as custom shared `ui-*` primitives under `shared/components`; do not add a UI component library. OpenLayers renders OpenStreetMap tiles and emits coordinate selections during creation and editing.

## Technical Context

**Language/Version**: C# / .NET 10 backend; TypeScript / Angular 22 frontend

**Primary Dependencies**: ASP.NET Core MVC, EF Core + SQLite, Angular standalone components/signals/reactive forms, RxJS, OpenLayers, OpenStreetMap tile service; custom shared UI primitives

**Storage**: SQLite `notes.db`; existing local data is reset by deleting the database before this schema change because the application uses `EnsureCreated()` without migrations

**Testing**: .NET test project for hierarchy/lifecycle controller behavior; Angular Vitest/TestBed for store, components, and map adapter contracts

**Target Platform**: Local development web application in modern desktop and mobile browsers

**Project Type**: Two-tier web application

**Performance Goals**: Return type-ahead suggestions within two seconds for 1,000 note-locations; keep map/tree/detail selection synchronized during normal interaction

**Constraints**: Single user; no authentication; use Angular signals only for application state; shared UI primitives and CSS tokens for all feature controls; map remains visible; parent cannot change after creation

**Scale/Scope**: At least 1,000 note-locations in a manually defined forest, with multiple roots; one location edit/archive operation at a time

## Constitution Check

*GATE: Passed before Phase 0 and re-checked after Phase 1 design.*

| Constitution Principle | Plan Response | Status |
|---|---|---|
| Simplicity First | Retain the existing `NotesController`, `NotesDbContext`, API client, and one feature container. Add no repositories, mediators, or state library. | Pass |
| Explicit Schema Evolution | Document and execute local deletion of `notes.db` before running this version; update `docs/data-model.md`, `docs/api.md`, `docs/frontend.md`, `docs/architecture.md`, and `docs/development.md` during implementation. | Pass |
| Consistent, Token-Driven UI | Compose tree, search, form, actions, and empty states from custom shared `ui-*` primitives; add missing reusable controls there rather than using a UI library. Add only a map wrapper for OpenLayers and derive all feature styling from global tokens. | Pass |
| Secure-by-Default Input Handling | Use DataAnnotations for request validation; preserve escaped title/description search patterns; validate parent existence and block forbidden archive/delete transitions server-side. | Pass |
| Test Coverage Commensurate with Complexity | Add backend tests because hierarchy and lifecycle rules are non-trivial; retain/add Vitest coverage for the store, presentational contracts, and map interaction boundary. | Pass |

## Project Structure

### Documentation (this feature)

```text
specs/001-location-based-notes/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
```text
be/
├── travel-note-api/
│   ├── Controllers/NotesController.cs
│   ├── Data/NotesDbContext.cs
│   ├── Dtos/NoteDtos.cs
│   └── Models/Note.cs
└── travel-note-api.Tests/
    └── NotesControllerTests.cs

fe/travel-notes-app/
└── src/app/
    ├── core/
    │   ├── models/note.ts
    │   ├── services/notes-api.ts
    │   └── services/notes-store.ts
    ├── features/notes/
    │   ├── notes-page.*
    │   ├── location-tree/
    │   ├── location-search/
    │   ├── location-map/
    │   └── location-detail/
    └── shared/components/
```

**Structure Decision**: Keep the existing two-tier layout and evolve its single notes vertical slice. The API remains one resource/controller; the frontend gains focused presentational components beneath `features/notes`, with `NotesPage` remaining the only component that injects the store.

## Complexity Tracking

No constitution violations require justification.
