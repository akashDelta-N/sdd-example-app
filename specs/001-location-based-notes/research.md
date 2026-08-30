# Research: Location-Based Notes

## Mapping engine

**Decision**: Use OpenLayers through the `ol` package with OpenStreetMap standard map tiles.

**Rationale**: OpenLayers supplies geographic projection, map-click events, pan/zoom, vector pins, and viewport fitting without adding a UI component library. All application controls, hierarchy, forms, and styling remain custom Angular components.

**Alternatives considered**:

- Leaflet: smaller conceptual surface, but OpenLayers was selected for greater map and layer control.
- A custom canvas map: would require rebuilding geographic projection, pan/zoom, hit testing, and pin layers.
- Commercial map services: add keys, quotas, and vendor dependence beyond the local feature scope.

## OpenStreetMap usage

**Decision**: Use standard OpenStreetMap tiles in development and show their required attribution.

**Rationale**: The feature is local and single-user. Keeping tile selection at the OpenLayers boundary permits a later provider change without changing note-location workflows.

**Alternatives considered**:

- Self-hosted tiles: unnecessary operational overhead.
- No basemap: makes travel orientation and click-to-place less useful.

## Unified note-location model

**Decision**: Evolve `Note` into one note-location entity with required title, latitude, longitude; optional body and parent; and archive state.

**Rationale**: It matches the confirmed user model. A title-only Tokyo is a valid structural node, while a venue can carry written travel content. No location/note relationship or reassignment policy is needed.

**Alternatives considered**:

- Separate location and note entities: enables multiple notes per place but adds ownership, deletion, and UI complexity without supporting the requested model.

## Existing database transition

**Decision**: Delete the local `notes.db` before first launch; do not introduce migrations.

**Rationale**: Existing flat notes lack required geographic positions. A synthetic default would create invalid map places. The app is a local SDD example already using `EnsureCreated()` with no data-preservation requirement.

**Alternatives considered**:

- A migration with synthetic coordinates: preserves rows but violates the required-position model.
- Optional coordinates: contradicts the confirmed model and complicates map semantics.

## Hierarchy and frontend boundaries

**Decision**: Keep bounded hierarchy guards in `NotesController`; retain `NotesStore` as the data owner. The map component owns OpenLayers lifecycle and emits typed map events to `NotesPage`.

**Rationale**: This retains the project’s thin validate-persist-map pattern, signals-based state, and single container/store ownership without new layers.

**Alternatives considered**:

- Repository/service layers or a map-specific store: unnecessary indirection for one feature.