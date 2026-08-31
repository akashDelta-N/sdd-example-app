# Feature Specification: Location-Based Notes

**Feature Branch**: `001-location-based-notes`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "I've prepared a list with a mockup screenshot of the initial idea and a further improved mockup HTML page to show what I expect the app to look like."

## Clarifications

### Session 2026-08-31

- Q: What identifier type should a note-location use? -> A: GUID

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse a Location Hierarchy (Priority: P1)

As a traveler, I can browse a tree of location-based notes and select a location from either the tree or the map, so I can explore my travel research by place rather than through a flat list.

**Why this priority**: Browsing a location hierarchy with a synchronized map is the core value of the product and makes an otherwise unwieldy note collection useful.

**Independent Test**: Create a hierarchy with multiple root locations and descendants, select locations from the tree and map, and confirm the selected note, ancestor path, tree state, and markers remain synchronized.

**Acceptance Scenarios**:

1. **Given** multiple root note-locations exist and no location is selected, **When** the browsing view opens, **Then** the tree lists the root locations and the map shows a marker for each root location.
2. **Given** a location with direct children is selected from the tree, **When** the selection changes, **Then** the tree highlights it, its ancestor path is shown, its note is displayed, and the map shows markers for its direct children.
3. **Given** a leaf location is selected, **When** the selection changes, **Then** the map shows one marker at the selected location and the detail view shows that location's note.
4. **Given** locations are displayed as markers, **When** the user selects a marker, **Then** that location is selected in the tree and its note and map context are shown.
5. **Given** a location parent has note content, **When** it is selected, **Then** the user can read its content without losing access to its child markers.

---

### User Story 2 - Create and Edit Note-Locations (Priority: P1)

As a traveler, I can create root or child note-locations and edit their title, description, and position, so I can build and keep my travel hierarchy accurate.

**Why this priority**: A browsable hierarchy has no ongoing value unless users can capture and correct locations and notes.

**Independent Test**: Create one root and one child note-location by choosing map positions, then edit each location's content and position and confirm the updates appear in the tree, detail view, and map.

**Acceptance Scenarios**:

1. **Given** no location is selected, **When** the user creates a root note-location with a title and a chosen map position, **Then** it is saved as a root and appears in the tree and on the map.
2. **Given** a location is selected, **When** the user creates a child with a title and chooses a map position, **Then** the chosen position is saved and the child appears beneath the selected location.
3. **Given** a location is being created or edited, **When** the user selects a map position, **Then** the location's latitude and longitude are captured from that point.
4. **Given** an existing location is open for editing, **When** the user changes its title, optional description, or map position and saves, **Then** the updated values are shown throughout the browsing view.
5. **Given** a location has been created, **When** the user edits it, **Then** its parent cannot be changed.

---

### User Story 3 - Find a Note-Location (Priority: P2)

As a traveler, I can use type-ahead search to find a location by title or description and open it within the hierarchy, so I can quickly return to a specific note in a large collection.

**Why this priority**: Search improves retrieval as the hierarchy grows but is not required to make the primary browse-and-capture workflow viable.

**Independent Test**: Search for text that appears in a nested location's title or description, select the suggestion, and confirm its ancestor chain expands and the same location is selected in the tree, map, and detail view.

**Acceptance Scenarios**:

1. **Given** a search term matches one or more location titles or descriptions, **When** the user enters the term, **Then** matching locations are offered as type-ahead suggestions.
2. **Given** a matching location is nested in a collapsed branch, **When** the user selects its search suggestion, **Then** its ancestors expand, the location is selected, its note is shown, and the map updates to that location's context.
3. **Given** a search term matches no locations, **When** the user enters the term, **Then** no matching suggestion is offered and the existing selection remains unchanged.

---

### User Story 4 - Archive and Delete Leaf Locations (Priority: P2)

As a traveler, I can archive an obsolete leaf location, restore it from its edit view, and delete an archived leaf location, so I can manage my notes without breaking the hierarchy.

**Why this priority**: Maintaining trustworthy notes matters, but it depends on the hierarchy and editing experience.

**Independent Test**: Archive a leaf, verify it remains visible but visually distinct, unarchive it through editing, then archive and delete it; attempt the same actions on a parent and verify both are blocked with an explanation.

**Acceptance Scenarios**:

1. **Given** an active location has no children, **When** the user archives it, **Then** it remains in the tree with a visually muted archived state.
2. **Given** an archived location is opened for editing, **When** the user changes it back to active and saves, **Then** the archived indicator is removed and the location is active again.
3. **Given** an archived location has no children, **When** the user deletes it, **Then** it is removed from the hierarchy and map.
4. **Given** a location has one or more children, **When** the user attempts to archive or delete it, **Then** the action is blocked and the user is told that children must be resolved first.

---

### User Story 5 - Use the App While Travelling (Priority: P3)

As a traveler using a phone, I can browse, search, create, edit, archive, and delete note-locations in a stacked layout, so I can manage notes away from a desktop.

**Why this priority**: Mobile access is important for travel but builds on the complete core workflows.

**Independent Test**: On a small-screen viewport, complete each primary browsing, search, editing, archiving, and deletion workflow using the stacked map, tree, and detail layout.

**Acceptance Scenarios**:

1. **Given** the app is viewed on a small screen, **When** the browsing view opens, **Then** the map, tree, and detail areas are arranged vertically with the map before the tree and detail.
2. **Given** the app is viewed on a small screen, **When** the user performs a supported desktop workflow, **Then** the same workflow can be completed without horizontal scrolling.

### Edge Cases

- A location may be a root, have a description or no description, and have children; parent locations are not required to be empty.
- A selection that has no direct children shows its own position rather than an empty map state.
- A user may create more than one root location.
- Archived locations remain searchable and selectable so they can be reviewed or restored.
- Deleting a location is only available after it has been archived and only while it has no children.
- If a map position cannot be selected or saved, the user receives a clear error and the unsaved location is not added to the hierarchy.
- If a location is deleted while selected, the selection returns to its parent, or to no selection when it was a root.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST assign each note-location a unique GUID and store its title, optional description, geographic latitude and longitude, creation time, last-update time, archive state, and optional parent GUID.
- **FR-002**: The system MUST require a title and geographic position when creating a note-location and MUST allow the description to be blank.
- **FR-003**: The system MUST allow users to create multiple root note-locations and child note-locations under the currently selected location.
- **FR-004**: The system MUST preserve the chosen parent relationship after creation; users cannot change a note-location's parent through the user interface.
- **FR-005**: The system MUST present note-locations in a collapsible hierarchy and visibly distinguish the currently selected item.
- **FR-006**: When no location is selected, the system MUST show markers for root note-locations; when a location is selected, it MUST show direct-child markers, or the selected location's marker when it has no children.
- **FR-007**: Selecting a location from the tree or map MUST synchronize the selected tree item, expanded ancestor path, displayed note, and map markers.
- **FR-008**: The system MUST display the selected location's complete ancestor path.
- **FR-009**: The system MUST allow a user to choose a map point while creating or editing a note-location and save the resulting latitude and longitude.
- **FR-010**: The system MUST allow a user to edit a note-location's title, description, position, and archive state.
- **FR-011**: The system MUST allow a user to archive only one childless note-location at a time and MUST visibly mute archived items while keeping them in the hierarchy.
- **FR-012**: The system MUST allow a user to restore an archived note-location only through that location's edit form.
- **FR-013**: The system MUST allow a user to delete only an archived, childless note-location.
- **FR-014**: When an archive or deletion action is unavailable because the location has children, the system MUST block the action and explain why.
- **FR-015**: The system MUST provide type-ahead suggestions that match note-location titles and descriptions.
- **FR-016**: Selecting a search suggestion MUST expand its ancestor chain and synchronize the selected tree item, detail view, and map context with that note-location.
- **FR-017**: The system MUST keep the map visible during all browsing states, including when no location is selected.
- **FR-018**: The system MUST support the same browsing, search, creation, editing, archiving, restoration, and deletion workflows on small screens in a vertically stacked layout.

### Key Entities

- **Note-Location**: A user-defined travel note associated with a single map position. It has a GUID, title, optional description, latitude, longitude, creation and update times, archive state, and an optional parent note-location identified by GUID.
- **Location Hierarchy**: The parent-child relationships among note-locations. It can contain multiple root note-locations and is created manually by the user rather than inferred from geography.
- **Map Context**: The current selected location and the markers visible for its direct children, its own position when childless, or roots when nothing is selected.
- **Search Suggestion**: A matching note-location offered while a user searches title or description text, including enough hierarchy context to open the result in the tree.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a titled root or child note-location by selecting a map point and save it in 60 seconds or less.
- **SC-002**: A user can navigate from a root note-location to a leaf location and see the correct detail and map context within three selections.
- **SC-003**: In a collection of at least 1,000 note-locations, 95% of title or description searches show matching suggestions within two seconds of completing the query.
- **SC-004**: In usability testing, at least 90% of participants can locate a specified nested note using either the tree or search on their first attempt.
- **SC-005**: In usability testing, 100% of attempts to archive or delete a location with children are prevented and explain the blocking condition.
- **SC-006**: On a small-screen viewport, users can complete the core browse, create, edit, archive, restore, and delete flows without horizontal scrolling.

## Assumptions

- Version 1 is a single-user travel-notes application; authentication, sharing, and multi-user collaboration are outside this feature's scope.
- The hierarchy is explicitly chosen by the user and is not automatically calculated from location coordinates.
- A geographic position is required for every note-location, including roots, because every item must be displayable on the map.
- Map content requires an available network connection; failures to load map content are communicated without making stored note content inaccessible.
- Permanent deletion is deliberately constrained to previously archived leaf locations; bulk archive, restore, and deletion actions are outside the initial scope.
- Importing existing notes, media attachments, tags, route planning, automatic geocoding, and changing a location's parent are outside the initial scope.