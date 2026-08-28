<!--
Sync Impact Report
Version change: 1.0.0 → 1.0.1
Rationale: Patch amendment — replace a vague rationale statement with an
explicit, testable coverage rule during constitution review.
Modified principles:
  - V. Test Coverage Commensurate with Complexity → wording clarified
Added sections:
  - none
Removed sections:
  - none
Deferred/TODO placeholders:
  - none
Templates requiring follow-up: none — plan/spec/tasks templates reference the
  constitution generically and need no changes for this amendment.
-->

# Travel Notes Constitution

## Core Principles

### I. Simplicity First
Every feature MUST use the simplest structure that solves the problem. For
CRUD-shaped work: one controller/service per resource, thin methods that
validate → persist → map to a DTO — no additional layers (repositories,
mediators, business-logic services) unless non-trivial logic actually exists
that needs isolating. On the frontend, no state management library beyond
Angular signals is permitted unless a documented state complexity problem
cannot reasonably be solved with signals. Rationale: this is a reference/
example app for spec-driven development; unnecessary abstraction obscures the
patterns it exists to demonstrate and slows every future change.

### II. Explicit Schema Evolution
Any change to a persisted entity's shape MUST be accompanied by an explicit,
documented decision about how existing data is handled — currently via
`EnsureCreated()` with no EF Core migrations, meaning schema changes do
nothing to an already-created database. A change MUST NOT silently assume the
database will "just update"; it MUST either (a) document that existing local
databases must be deleted, or (b) introduce EF Core migrations before the
change ships. `docs/data-model.md` MUST be updated in the same change.
Rationale: silent schema drift between code and an existing SQLite file is a
correctness bug that is easy to miss without an explicit gate.

### III. Consistent, Token-Driven UI
All UI elements that render a button, text input, textarea, card, or empty
state MUST use the corresponding shared `ui-*` primitive
(`shared/components/*`); new raw styled form/interactive elements in feature
code are NOT permitted. All component styling MUST derive from the CSS custom
properties (design tokens) in `src/styles.css` — no hardcoded colors, spacing,
radii, or font sizes. Presentational components MUST be `OnPush` with signal
`input()`/`output()` and MUST NOT inject services; only a feature's container
component may inject its store/API service. Rationale: a single source of
visual truth keeps the UI consistent as features are added by different
contributors (human or agent) over time.

### IV. Secure-by-Default Input Handling
All externally-supplied input MUST be validated at the boundary (DataAnnotations
on request DTOs) rather than re-checked ad hoc deeper in the call stack. Any
user-supplied text used inside a pattern-matching query (e.g., SQL `LIKE`)
MUST have wildcard/escape characters escaped before use. Dependency versions
pinned to remediate a known CVE (e.g., `Microsoft.OpenApi` at 2.7.5) MUST NOT
be bumped without re-verifying the original vulnerability and any
compatibility constraint that justified the pin. Rationale: these are the
concrete security-relevant patterns already established in this codebase;
regressing any of them re-introduces a known class of bug.

### V. Test Coverage Commensurate with Complexity
Frontend code MUST retain Vitest/TestBed coverage for store logic, presentational
component contracts (inputs/outputs), and any non-trivial template logic.
Backend code currently has no test project; the first time backend logic goes
beyond simple validate-persist-map CRUD, tests MUST be added alongside it —
zero backend coverage MUST NOT be extended further by adding untested
non-trivial logic. Rationale: coverage MUST track actual risk; a CRUD
passthrough needs less protection than the first piece of real business logic.

## Technology Stack Constraints

- Backend: ASP.NET Core (currently .NET 10), EF Core + SQLite. No alternative
  ORM or database engine without a documented reason recorded in
  `docs/architecture.md`.
- Frontend: Angular (currently v22), standalone components only (no
  `NgModule`), Angular signals for state, `pnpm` as the package manager,
  Vitest for tests. No NgRx/Redux-style store without a documented state
  complexity problem signals cannot address.
- Cross-cutting: no authentication/authorization, CORS policy, or production
  hosting configuration is currently required — this app is a local
  development/example target. Adding any of these is permitted but MUST be
  reflected in `docs/architecture.md` when it happens.

## Development Workflow

- `docs/` is the durable, git-committed reference for architecture, API,
  data model, frontend structure, and conventions. Any change that alters
  architecture, API shape, data model, frontend structure, or a convention
  documented in `docs/conventions.md` MUST update the corresponding doc in the
  same change.
- Feature work follows the spec-kit flow: `/speckit-specify` →
  `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`, with `/speckit-analyze` available to check
  cross-artifact consistency before implementation.
- Reviews (human or agent self-review before finalizing) MUST check compliance
  with the Core Principles above; deviations MUST be called out explicitly
  with a rationale rather than silently merged.

## Governance

This constitution supersedes ad hoc practice for anything it explicitly
covers. Amendments are made via the `speckit-constitution` workflow only —
direct hand-edits to this file bypass the required Sync Impact Report and
version bump and MUST NOT be made. Versioning follows semantic versioning:
MAJOR for backward-incompatible principle removals/redefinitions, MINOR for
new or materially expanded principles/sections, PATCH for wording/clarification
only. `docs/conventions.md` is the day-to-day operational guidance file for
applying these principles; when the two conflict, this constitution wins.

**Version**: 1.0.1 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-08-28
