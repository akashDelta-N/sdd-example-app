# Conventions

Conventions that apply across the codebase, for both humans and AI agents
making changes here. These are enforced by review/consistency, not by tooling
(no lint rule currently encodes them).

## Frontend

**UI primitives are mandatory for common elements.**
- Anything that renders a button, text input, textarea, card, or empty state
  must use the corresponding `shared/components/ui-*` primitive
  (`UiButton`, `UiTextInput`, `UiTextarea`, `UiCard`, `UiEmptyState`, etc.).
  Do not write raw styled `<button>`/`<input>` elements in feature code.
- All primitive styling must come from the CSS custom properties (design
  tokens) declared in `src/styles.css` — never hardcode a color, spacing
  value, radius, or font size in a component's own stylesheet.

**Component roles are split deliberately.**
- Presentational components (`shared/components/*`, and most of
  `features/notes/*` except `NotesPage`) are `OnPush`, use signal
  `input()`/`output()`, and inject no services.
- Only the container component for a feature (e.g. `NotesPage`) is allowed to
  inject the feature's store/service directly. Other components communicate
  purely through `@Input`/`@Output`.
- Form controls that need to integrate with `ReactiveFormsModule`
  (`UiTextInput`, `UiTextarea`) implement `ControlValueAccessor` and are bound
  via `[formControl]`/`formControlName` — not `[(ngModel)]` or manual event
  wiring.

**State lives in signal-based stores, not components.**
- Cross-component state belongs in a `core/services/*-store.ts` service using
  Angular signals (see `NotesStore`), not in component fields or a
  third-party state library.
- Debounce user input at the store boundary (e.g. search) with RxJS +
  `takeUntilDestroyed()`, not inside the component.

## Backend

**Keep the API minimal-API-shaped, even inside a controller.**
- One controller per resource, thin action methods: validate via
  DataAnnotations on the input DTO, do the EF Core call, map to a `record` DTO
  for the response. No business-logic layer/service classes for CRUD-only
  operations — introduce one only when actual non-trivial logic appears.
- Read-only queries use `AsNoTracking()`.
- Every DB-touching action method accepts and forwards a `CancellationToken`.

**Validate and sanitize at the boundary.**
- Required/length constraints go on the DTO (`NoteInput`) via DataAnnotations,
  not re-checked manually in the controller.
- User-supplied text used in a `LIKE` query must have `%`, `_`, and `\`
  escaped first (see `NotesController.GetAll`) to avoid unintended wildcard
  behavior — this is a correctness rule, not just a security one, since SQLite
  has no parameterized wildcard-escaping by default.
- Trim user-facing string fields (e.g. `Title`) server-side before persisting.

**Schema changes require a conscious decision, not just an entity edit.**
- There are no EF Core migrations; `EnsureCreated()` only creates a schema
  once, if the database doesn't already exist. Changing `Note` without adding
  a migration strategy will silently do nothing for existing databases — see
  [data-model.md](data-model.md).

## Testing

- Frontend: Vitest + `TestBed`. Mock injected services with `vi.fn()`
  returning observables (`of(...)`/`throwError(...)`); assert on signals after
  `await`-ing store methods; use `fixture.componentRef.setInput()` for inputs
  and `await fixture.whenStable()` after imperative input changes.
- Backend: no test project exists yet. If adding backend logic beyond simple
  CRUD, add tests alongside it rather than leaving coverage at zero.

## Documentation

- `docs/` is the git-committed, durable reference for architecture, API,
  data model, frontend structure, and these conventions — keep it in sync
  when making structural changes.
- Local, ephemeral agent notes (day-to-day gotchas, working context) belong in
  repo-scoped agent memory, not in `docs/`. Some overlap between the two is
  expected and fine.
