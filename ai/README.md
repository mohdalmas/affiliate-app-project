# /ai — continuity notes for whoever (human or AI) works on this repo next

This folder is not app code and ships nothing to production. It exists so
a new Claude Code session — or a human six months from now — can pick up
this project cold, without a re-explanation prompt, and extend it the same
way it's already built.

`CLAUDE.md` at the repo root `@`-imports [`CONTEXT.md`](CONTEXT.md) and
[`PENDING.md`](PENDING.md), so both load automatically at the start of
every session. The other two files here are read on demand, not
auto-loaded (they're allowed to grow long):

| File | What it's for | Loaded |
|---|---|---|
| [`CONTEXT.md`](CONTEXT.md) | The primer — stack, data model, file map, established conventions. Read this first, or let CLAUDE.md hand it to you. | Always |
| [`PENDING.md`](PENDING.md) | Live checklist — unrun migrations, unreviewed copy, deliberately-deferred features. Update this whenever you finish or defer something. | Always |
| [`DECISIONS.md`](DECISIONS.md) | Dated ADR-style log: notable choices and *why*, so they don't get silently re-litigated or reverted by someone who didn't see the tradeoff. | On demand |
| [`CHANGELOG.md`](CHANGELOG.md) | Chronological log of what shipped, session by session. | On demand |

There's also a project skill at
[`.claude/skills/admin-entity/SKILL.md`](../.claude/skills/admin-entity/SKILL.md) —
the exact recipe this codebase uses for "add a new admin-managed thing"
(Products, Landing pages, Home sections, and Legal pages all follow it
identically). Claude should reach for it automatically for that shape of
task; a human can read it directly too.

## Maintaining this folder

Update it as part of the same change, not as an afterthought:

- Shipped something? Add one line to `CHANGELOG.md`, update `CONTEXT.md`
  if it changed the data model/conventions/file map, and add/remove a
  `PENDING.md` line (new migration to run, a TODO now done).
- Made a call with a real tradeoff (schema shape, what to build vs. defer,
  a pattern to follow project-wide)? Add a `DECISIONS.md` entry — a
  paragraph, not an essay.
- Established a new *repeatable* pattern (not a one-off)? Extend the
  `admin-entity` skill, or add a new skill next to it, instead of leaving
  the pattern implicit in a diff someone has to go re-read.

The goal isn't more documentation for its own sake — it's that the next
session's first message can be a task, not a briefing.
