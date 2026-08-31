# Research: Location-Based Notes

## Map Rendering and Position Picking

**Decision**: Use OpenLayers with OpenStreetMap tiles, wrapped in one presentational Angular map component.

**Rationale**: The feature explicitly requires OpenLayers and OpenStreetMap. OpenLayers provides the needed tile display, markers, viewport fitting, click-to-coordinate behavior, and event cleanup. The wrapper keeps imperative map state out of the page and exposes only inputs for markers/selection/edit mode plus outputs for marker and coordinate selection.

**Alternatives considered**:

- Leaflet: simpler for basic markers but does not meet the explicit OpenLayers requirement.
- A custom map surface: cannot deliver real geographic tiles or reliable geographic coordinate selection.

## Shared UI Components

**Decision**: Use and extend the project's custom `shared/components/ui-*` primitive library; do not introduce a third-party UI component library.

**Rationale**: The project already provides custom button, field, text input, textarea, card, layout, and empty-state primitives, and its conventions require them. Keeping the existing `ui-*` names avoids a disruptive rename while allowing missing reusable controls to be added in the same directory with token-driven styling.

**Alternatives considered**:

- Rename existing primitives from `ui-button` and `ui-field` to generic names: offers no functional benefit and would create unnecessary repository-wide churn.
- Adopt a component library: conflicts with the existing custom design system and adds duplicate control implementations.

## Hierarchy Data Access

**Decision**: Continue using the existing `api/notes` resource and add endpoints that return the full hierarchy/list search and direct children, alongside existing item reads and writes.

**Rationale**: All persisted records remain note-locations. One controller and resource retain the established validate-persist-map style while supplying tree construction, type-ahead, and current-map-context data efficiently. The frontend can derive the expanded tree from a cached full hierarchy while requesting direct children only where necessary.

**Alternatives considered**:

- A separate locations resource: duplicates the same entity and invites inconsistent lifecycle rules.
- Returning all descendants for every selection: transfers unnecessary data and obscures the direct-child marker rule.

## Archive and Delete Enforcement

**Decision**: Enforce parent-child and archive lifecycle rules in the API, with the UI also disabling unavailable actions and explaining the reason.

**Rationale**: Client state can become stale, while server-side checks ensure no caller can archive/delete a parent or delete an active item. The UI can give immediate feedback, but the API remains the authority.

**Alternatives considered**:

- UI-only validation: unsafe if requests are sent directly or if child state changes between rendering and action.
- Cascading archive/delete: contradicts the requirement to prevent loss of nested notes.

## Schema Evolution

**Decision**: Delete the existing local `notes.db` before introducing location columns and the self-referencing parent relationship.

**Rationale**: The project explicitly uses `EnsureCreated()` without migrations and is a local example application. A reset makes the new schema deterministic and complies with the constitution's explicit schema-evolution rule.

**Alternatives considered**:

- Keep the existing database: `EnsureCreated()` will not alter it, leaving runtime/schema mismatch.
- Introduce migrations: preserves data but adds durable migration workflow complexity that is not justified for this local v1 change.

## Search Behavior

**Decision**: Keep the existing debounced search pattern; return title/description matches with ancestor information sufficient for the client to expand and select the result.

**Rationale**: This preserves the established escaped `LIKE` search safety behavior and allows search to act as navigation rather than a separate result view.

**Alternatives considered**:

- Client-only filtering: requires loading the complete data set and makes server-side scale criteria weaker.
- A separate search page: breaks the requirement for search selection to open the matching item in the hierarchy.