# Feature Specification: Location-Based Notes

**Feature Branch**: `001-location-based-notes`

**Created**: 2026-08-30

**Status**: Draft

**Input**: User description: "Organize travel notes in an arbitrary-depth location hierarchy and explore that hierarchy on a map."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Note-Locations (Priority: P1)

As a traveler, I want to browse an arbitrary-depth hierarchy of note-locations and open a selected note-location, so that I can find preparation notes by place instead of scanning one long list.

**Why this priority**: This is the core value of the feature: location-based organization and retrieval of existing notes.

**Independent Test**: Create a small hierarchy with written content at several levels, select each note-location, and verify that its content can be read and the path back to the hierarchy root is clear.

**Acceptance Scenarios**:

1. **Given** note-locations for Japan, Tokyo, and Asakusa, **When** the traveler selects Asakusa, **Then** they see its written content and a breadcrumb path of Japan > Tokyo > Asakusa.
2. **Given** a note-location with content and child note-locations, **When** the traveler chooses to include children, **Then** content from that note-location's descendant hierarchy is shown.
3. **Given** a note-location with no written content, **When** the traveler selects it, **Then** they can see that it is an empty structural note-location without losing access to its child note-locations or parent path.

---

### User Story 2 - Build and Maintain a Note-Location Tree (Priority: P1)

As a note taker, I want to create, rename, reposition, move, archive, and eventually delete note-locations, so that the location tree stays accurate as my travel planning evolves.

**Why this priority**: Travelers cannot organize or maintain location-based notes without a reliable hierarchy.

**Independent Test**: Create a root note-location and nested children, rename and move one child, archive a leaf note-location, then permanently delete that archived leaf; verify the visible hierarchy and map reflect every change.

**Acceptance Scenarios**:

1. **Given** add mode is active with no parent selected, **When** the note taker selects a point on the map and supplies a title, **Then** a root note-location is created at that point.
2. **Given** add mode is active with a parent selected, **When** the note taker selects a point on the map and supplies a title, **Then** a child note-location is created at that point under the selected parent.
3. **Given** a note-location has one parent, **When** the note taker moves it to a different parent, **Then** the note-location and all of its children move together and it has only the new parent.
4. **Given** a note-location has no active children, **When** the note taker archives it, **Then** it remains visible but greyed out in the location list and is hidden from the map.
5. **Given** a note-location has any children, **When** the note taker tries to permanently delete it, **Then** the action is blocked and the reason is shown.
6. **Given** an archived note-location with no children, **When** the note taker permanently deletes it, **Then** its title, map position, and written content no longer appear in the hierarchy, location list, or map.

---

### User Story 3 - Write and Reorganize Note-Locations (Priority: P1)

As a note taker, I want to add optional written content to each note-location and move it later, so that both broad planning notes and precise place notes remain organized correctly.

**Why this priority**: The hierarchy is only useful when every node can contain the travel information it represents.

**Independent Test**: Add written content to a country, city, and specific venue; move a note-location between parents; verify its content is returned under its new path only.

**Acceptance Scenarios**:

1. **Given** a note-location with only a title and map position, **When** the note taker adds written content, **Then** that content is shown when the note-location is selected.
2. **Given** a note-location beneath Tokyo, **When** the note taker changes its parent to Asakusa, **Then** its content is no longer shown under Tokyo's direct children and is shown under Asakusa's direct children.
3. **Given** a note-location contains written content, **When** the note taker deletes that archived leaf note-location, **Then** its content is deleted with it.

---

### User Story 4 - Explore the Hierarchy on a Map (Priority: P2)

As a traveler, I want to use a map to explore note-locations one hierarchy level at a time, so that I can orient myself geographically while finding notes.

**Why this priority**: The map improves navigation and context, but the hierarchy and note workflows retain standalone value without it.

**Independent Test**: Start with multiple root note-locations, select one map pin, confirm its children are shown as the next level of pins, select a child, and return to the parent.

**Acceptance Scenarios**:

1. **Given** the traveler is viewing the root of the hierarchy, **When** the map is displayed, **Then** it shows a pin for each active root note-location.
2. **Given** the traveler selects a note-location pin with child note-locations, **When** the map updates, **Then** it centers on that note-location and shows its active children as pins.
3. **Given** the traveler has navigated into a location, **When** they select its breadcrumb parent, **Then** the map returns to the parent level and shows the relevant pins.
4. **Given** edit mode is active, **When** the note taker selects a new point for a note-location, **Then** it moves to the selected point without changing its title, parent, children, or written content.

---

### User Story 5 - Search Locations and Notes (Priority: P3)

As a traveler, I want to search note-location titles, so that I can jump directly to a known place or note without manually traversing the hierarchy.

**Why this priority**: Search speeds up repeat use but does not replace the core browsing flows.

**Independent Test**: Search for a unique note-location title, open its result, and verify its hierarchy path is shown.

**Acceptance Scenarios**:

1. **Given** note-location titles match a search term, **When** the traveler searches by title, **Then** matching note-locations are returned with their hierarchy paths.
2. **Given** two note-locations have the same title under different parents, **When** the traveler searches for that title, **Then** both note-locations are returned and can be distinguished by their paths.

### Edge Cases

- A note-location title may repeat under different parents; the hierarchy path distinguishes them.
- A note-location may have any number of nested levels; levels such as country, city, or venue are not predefined.
- A note-location cannot be moved under itself or one of its descendants.
- Archived note-locations are excluded from map pins but remain discoverable in the location list.
- A root note-location is created from a map click when no parent is selected.
- Searches with no matches clearly report that no note-locations were found.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST represent each map place and its optional written content as one note-location.
- **FR-002**: The system MUST require every note-location to have a title, latitude, and longitude; written content is optional.
- **FR-003**: The system MUST organize note-locations as an arbitrary-depth tree in which each note-location has at most one parent and may have multiple children.
- **FR-004**: The system MUST allow a note taker to create a root note-location by selecting a map position in add mode while no parent is selected, then supplying a title.
- **FR-005**: The system MUST allow a note taker to create a child note-location by selecting a map position in add mode while a parent is selected, then supplying a title.
- **FR-006**: The system MUST allow a note taker to change a note-location's title, written content, and map position in edit mode.
- **FR-007**: The system MUST allow a note-location and its complete descendant subtree to be moved under a different parent, while preventing cycles.
- **FR-008**: The system MUST allow note-locations with identical titles when they belong to different parent note-locations.
- **FR-009**: The system MUST allow a note taker to archive a note-location only when it has no active child note-locations.
- **FR-010**: The system MUST keep archived note-locations visible in the location list with a visually distinct archived state and exclude them from map pins.
- **FR-011**: The system MUST allow permanent deletion only for an archived note-location with no child note-locations; its written content is deleted with it.
- **FR-012**: The system MUST show a selected note-location's written content and provide a choice to include content from its descendants.
- **FR-013**: The system MUST show active note-locations as map pins for the currently viewed hierarchy level and let the traveler select a pin to navigate to that note-location.
- **FR-014**: The system MUST provide a breadcrumb path for the selected note-location and allow navigation to each active ancestor.
- **FR-015**: The system MUST provide a location list/tree view, including archived note-locations, for browsing and management.
- **FR-016**: The system MUST search note-location titles and display each result's hierarchy path.
- **FR-017**: The system MUST support a single shared set of note-locations; user accounts, sharing, and permissions are out of scope.

### Key Entities *(include if feature involves data)*

- **Note-Location**: One travel-planning item that combines a map place and optional written note. It has a required title and map position, zero or one parent, any number of children, and an active or archived state.
- **Location Path**: The ordered sequence of note-locations from a root to a selected note-location, used for hierarchy navigation and distinguishing duplicate titles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A traveler can find and open a known note-location within 30 seconds by browsing the hierarchy or using search.
- **SC-002**: A note taker can create a titled note-location at a selected map position within 60 seconds.
- **SC-003**: In usability testing with five representative hierarchies containing at least four levels, users complete hierarchy navigation, moving, and archive flows without data-loss errors in 100% of test attempts.
- **SC-004**: Users can distinguish duplicate note-location titles by their displayed hierarchy paths in 100% of verification cases.
- **SC-005**: Archived note-locations never appear as map pins and remain accessible in the location list in 100% of verification cases.

## Assumptions

- The feature is for one shared user context; authentication, ownership, collaboration, and permissions are out of scope.
- Location names are entered as free text; no external place directory or address lookup is required.
- Map selection provides the position for a new location, and map editing changes an existing location's position.
- A note-location may have arbitrary depth and titles need only be distinguishable by their paths, not globally unique.
- Existing note create, edit, and delete capabilities evolve into note-location management; a note-location may be created with only its required title and map position.