# Implementation Plan: Location-Based Notes

**Branch**: `001-location-based-notes` | **Date**: 2026-08-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-location-based-notes/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Evolve the flat `Note` into a unified `NoteLocation`: one map-positioned, titled item with optional written content and an optional parent. Extend the existing .NET CRUD API and Angular signal store, and replace the flat notes page with custom feature components that use OpenLayers plus OpenStreetMap tiles for map exploration and map-click creation. Reset the existing local SQLite database before first run because flat notes have no valid required coordinates.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: C#/.NET 10 backend; TypeScript 6 / Angular 22 frontend

**Primary Dependencies**: ASP.NET Core MVC, EF Core SQLite, Angular standalone components/signals/RxJS, OpenLayers (`ol`), OpenStreetMap standard tiles

**Storage**: SQLite `notes.db`; schema reset required for this local-development feature

**Testing**: Vitest + Angular TestBed for store, feature component contracts, and non-trivial template logic; manual API validation via `.http` file/OpenAPI during implementation

**Target Platform**: Local desktop browsers via Angular development server and local ASP.NET Core API

**Project Type**: Two-tier web application

**Performance Goals**: Hierarchy navigation and map-level changes render within 1 second for a local collection of up to 1,000 note-locations; title search results appear within 1 second after its debounce period

**Constraints**: Custom Angular UI built from existing shared primitives; no UI component library or state-management library; OpenLayers isolated to the map feature component; OpenStreetMap attribution displayed; no authentication, sharing, or external place lookup

**Scale/Scope**: One shared local user, one note-location tree of arbitrary depth, up to 1,000 active/archived note-locations; one map-centric notes workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Plan response |
|------|--------|---------------|
| I. Simplicity First | Pass | Retain one controller and the existing API/store pattern. Add no repository, mediator, or state-management layer. |
| II. Explicit Schema Evolution | Pass | Delete the existing local `notes.db` before first launch because required coordinates cannot be inferred for legacy notes. Update `docs/data-model.md` in implementation. |
| III. Consistent, Token-Driven UI | Pass | Reuse existing shared primitives for buttons, fields, text input, textarea, cards, rows, columns, and empty states. The custom map host is the sole specialized feature surface. |
| IV. Secure-by-Default Input Handling | Pass | Validate titles, body length, latitude/longitude bounds, and parent identifiers on request DTOs; retain escaped search input. |
| V. Test Coverage Commensurate with Complexity | Pass | Add focused frontend store and component tests. Backend logic remains validate-persist-map CRUD plus small hierarchy guard rules; add backend tests if implementation grows beyond that boundary. |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
be/travel-note-api/
├── Controllers/NotesController.cs
├── Data/NotesDbContext.cs
├── Dtos/NoteDtos.cs
├── Models/Note.cs
└── travel-note-api.http

fe/travel-notes-app/src/app/
├── core/
│   ├── models/note.ts
│   └── services/notes-api.ts, notes-store.ts
├── features/notes/
│   ├── notes-page/
│   ├── note-form/
│   ├── note-list/
│   ├── note-item/
│   └── location-map/
└── shared/components/

docs/
├── api.md
├── architecture.md
└── data-model.md
```

**Structure Decision**: Extend the existing vertical notes feature and its `NotesStore`; do not introduce a separate location resource because a note-location is one entity. Keep OpenLayers lifecycle and event handling in `features/notes/location-map`, emitting typed domain events to `notes-page`.

## Complexity Tracking

No constitution violations require justification.
