# Travel Notes — Documentation

Travel Notes is a small full-stack example app: a .NET Web API backed by SQLite,
and an Angular single-page frontend, for creating, searching, editing, and
deleting free-form travel notes. It exists as a reference app for practicing
spec-driven development (SDD) with [GitHub spec-kit](../.specify/).

This folder is the durable, git-committed source of truth for how the app is
built and why. It is written for two audiences at once: humans onboarding to the
codebase, and AI agents that need grounded context before writing specs, plans,
or code.

## Start here

- **Agents doing SDD**: read [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md)
  first — it captures the non-negotiable project principles. Then use these docs
  as supporting context when drafting specs (`/speckit-specify`), plans
  (`/speckit-plan`), and tasks (`/speckit-tasks`).
- **Humans onboarding**: start with [development.md](development.md) to get the
  app running, then [architecture.md](architecture.md) for the big picture.

## Contents

| Doc | Covers |
|---|---|
| [architecture.md](architecture.md) | System overview, component diagram, request flow, key architectural decisions |
| [api.md](api.md) | REST endpoints, request/response shapes, validation rules |
| [data-model.md](data-model.md) | `Note` entity, schema, persistence strategy |
| [frontend.md](frontend.md) | Angular app structure, state management, shared component library |
| [development.md](development.md) | Local setup, run/test commands, ports, proxying |
| [conventions.md](conventions.md) | Coding conventions for humans and agents |

## Out of scope for these docs

- Feature-level specs — those live under `specs/` once created via `/speckit-specify`.
- Agent session/working memory — see `/memories/repo/notes.md` (local to this
  workspace, not committed) for terse day-to-day gotchas.
