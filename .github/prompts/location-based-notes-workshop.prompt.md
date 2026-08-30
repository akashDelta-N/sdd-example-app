---
name: "Location-Based Notes Workshop"
description: "Use when: specifying and planning a map-based, hierarchical travel notes feature with Spec Kit."
argument-hint: "Optional additional workshop constraints"
agent: "agent"
---

Help me use the Spec Kit workflow to specify, then plan, a location-based travel-notes feature. First, review the existing project and discuss only decisions that are still genuinely unclear. Do not implement code.

The product idea is to organize travel preparation notes as a hierarchy that can be explored geographically. For example: Japan > Tokyo > Asakusa > Senso-ji. Selecting an item should keep the map visible while showing its information and children.

The agreed product model is deliberately simple:

- A map place and its note are one item, called a **note-location**. Do not create separate `Location` and `Note` entities.
- A note-location requires a title, latitude, and longitude. Its written content/body is optional.
- A title-only note-location is valid. For example, create `Tokyo` with no written content as a structural parent.
- A note-location has zero or one parent and may have many children. The hierarchy is a tree with arbitrary depth.
- The same title is allowed under different parents. The full hierarchy path distinguishes them.
- A root is created by clicking the map in add mode with no parent selected. A child is created by selecting its parent, then clicking the map in add mode.
- Edit mode can change a note-location's title, optional body, position, and parent. Moving an item moves its full subtree and must never create a cycle.
- A note-location can be archived only when it has no active children. Archived items remain greyed out in the list/tree but are hidden from the map.
- A note-location can be permanently deleted only after it is archived and has no children. Deleting it also deletes its optional written content.
- The app is single-user and shared for now. Authentication, permissions, sharing, and external place/address lookup are out of scope.

The expected user experience includes:

- A map showing the active note-locations at the current hierarchy level as pins.
- Clicking a pin to navigate into that note-location and reveal its active children as the next map level.
- Breadcrumb navigation to ancestors.
- A tree/list view including archived note-locations.
- Direct content for the selected note-location, with an option to include content from descendants.
- Search by note-location title, with result paths so duplicate titles are distinguishable.

Use `/speckit-specify` to create a technology-agnostic feature specification. Create independently testable, prioritized user stories; functional requirements; edge cases; measurable success criteria; assumptions; and key entities. Keep at most three clarification markers, and only use them for decisions that materially change scope or user experience.

After the specification has no unresolved clarification markers, use `/speckit-plan` and follow the repository constitution. Use these implementation constraints:

- Backend: the existing ASP.NET Core/.NET 10 API with EF Core and SQLite.
- Frontend: the existing Angular 22 standalone application with signals and pnpm.
- Keep the existing lightweight, custom approach: no UI component library and no external state-management library. Reuse the project's shared UI primitives.
- Use OpenLayers with OpenStreetMap tiles for the map. Keep all OpenLayers lifecycle and event handling in one dedicated map feature component; do not spread map-library concerns through the application.
- Extend the existing notes API/controller and notes store; do not add repository, mediator, or service layers unless non-trivial logic makes one necessary.
- The current database uses `EnsureCreated()` and existing flat notes have no valid required coordinates. Document and use a local `notes.db` reset before the feature is first run rather than silently assuming the schema evolves.
- Plan validation through focused Angular Vitest/TestBed coverage, frontend build, backend build, and end-to-end manual scenarios.

Return the generated Spec Kit artifact paths and any questions requiring my decision.