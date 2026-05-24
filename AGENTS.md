# UResearch — Agent instructions

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout: root `CONTEXT.md` for domain language and root `docs/adr/` for durable architecture decisions. See `docs/agents/domain.md`.

### Architect planning pack

Global architect skills live in `~/.agents/skills/`. Start with `/architect` for the full catalog, or attach a category:

| Invoke | Category |
|--------|----------|
| `/architect` | Master index — all categories and leaf skills |
| `/architect-system-design` | DDD, decomposition, API gateway |
| `/architect-data-architecture` | Data model, storage, integrations |
| `/architect-quality-attributes` | Security, scale, reliability, observability, trade-offs |
| `/architect-decision-making` | ADRs, risk assessment |
| `/architect-communication` | C4 diagrams, RFCs, roadmaps |
| `/architect-governance` | Architecture review checklist |

Category skills route to **leaf skills** (verbatim upstream copies). The agent should read and follow the leaf `SKILL.md` at `~/.agents/skills/<skill-name>/SKILL.md`.

Attribution: `~/.agents/skills/ARCHITECT-SKILLS-SOURCES.md`

### Product and engineering skills

Pair architect planning with: `to-prd`, `grill-me`, `grill-with-docs`, `prototype`, `to-issues`.

### Coding behavior

Default coding behavior follows **Karpathy guidelines** — think before coding, simplicity first, surgical changes, goal-driven execution. Read and follow `~/.agents/skills/karpathy-guidelines/SKILL.md` when writing, reviewing, or refactoring code.

This repo also enforces them via `.cursor/rules/karpathy-guidelines.mdc` (`alwaysApply: true`).

Attribution: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)

### Domain context

See [GIST.md](./GIST.md) for the product summary.
