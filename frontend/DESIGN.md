---
name: AI Observability Platform
description: Dark, dense developer-tool dashboard for monitoring production systems and investigating incidents. Quality bar is Vercel / Linear / Grafana.
colors:
  bg: "#0a0a0a"
  surface: "#121317"
  surface-2: "#17191e"
  surface-hover: "#1c1f25"
  border: "#23262d"
  border-strong: "#30343c"
  fg: "#ededed"
  fg-muted: "#8b8f99"
  fg-subtle: "#62666f"
  accent: "#6e6af0"
  accent-hover: "#7f7bf3"
  success: "#3fb67a"
  warning: "#e5a83b"
  danger: "#e5534b"
  critical: "#f0436b"
---

# Design System: AI Observability Platform

## Overview

**Creative North Star: "The Quiet Control Room".** A dark, neutral, dense developer tool. The chrome is monochrome; colour appears only where it carries meaning: health state, log level, severity, the primary action, focus and selection. Telemetry is the content.

Dark-first. Personality: precise, technical, calm under pressure. Never playful, never "AI magic".

## Colors

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0a0a0a` | App background, main content |
| `surface` | `#121317` | Sidebar, cards, stat cards, tables |
| `surface-2` | `#17191e` | Secondary buttons, active nav, code blocks, chart tooltips |
| `surface-hover` | `#1c1f25` | Row / nav / button hover, selected span |
| `border` | `#23262d` | Every 1px divider, card border, chart grid lines |
| `border-strong` | `#30343c` | Input borders, focused rows |
| `fg` | `#ededed` | Primary text |
| `fg-muted` | `#8b8f99` | Labels, metadata, axis labels, inactive nav |
| `fg-subtle` | `#62666f` | Placeholders, DEBUG logs, disabled. Never body copy. |
| `accent` | `#6e6af0` | Primary button, focus, links, selection, main chart series, span bars |
| `success` | `#3fb67a` | Healthy, resolved, OK |
| `warning` | `#e5a83b` | Degraded, WARN, investigating, medium |
| `danger` | `#e5534b` | ERROR, open errors, high, failed, firing |
| `critical` | `#f0436b` | CRITICAL service, FATAL log, critical severity |

### State → colour (single source of truth)

| Domain | Value | Colour | Indicator |
|---|---|---|---|
| Service | `healthy` | `success` | filled dot |
| Service | `degraded` | `warning` | filled dot |
| Service | `critical` | `critical` | filled dot, soft pulse |
| Log level | `debug` | `fg-subtle` | text only |
| Log level | `info` | `fg-muted` | text only |
| Log level | `warn` | `warning` | text only |
| Log level | `error` | `danger` | text + 2px left bar on row |
| Log level | `fatal` | `critical` | text + 2px left bar on row |
| Error / Incident status | `open` | `danger` | filled dot |
| Error / Incident status | `investigating` | `warning` | filled dot |
| Error / Incident status | `resolved` | `success` | ✓ |
| Severity | `low` | `fg-muted` | hollow dot |
| Severity | `medium` | `warning` | filled dot |
| Severity | `high` | `danger` | filled dot |
| Severity | `critical` | `critical` | filled dot |
| Span | `ok` | `accent` | bar |
| Span | `error` | `danger` | bar |
| Alert | `ok` | `success` | filled dot |
| Alert | `firing` | `danger` | filled dot, soft pulse |
| AI analysis | `pending` | `accent` | dot, pulse |
| AI analysis | `completed` | `success` | ✓ |
| AI analysis | `failed` | `danger` | ✕ |

Badges are tinted: text in the state colour, background ~10% alpha, border ~30% alpha (`bg-warning/10 border-warning/30 text-warning`). Labels are human-readable ("Investigating"); the enum stays in data.

## Typography

- **Geist** for UI, **Geist Mono** for machine values (`next/font/google` in `layout.tsx`).
- **Mono is semantic:** trace IDs, span IDs, request IDs, endpoints (`POST /payments`), service names, versions (`v1.42.3`), durations, timestamps, counts, percentages, log messages, JSON metadata, API keys.
- Every number uses `tabular-nums`.

| Role | Tailwind |
|---|---|
| Page title | `text-2xl font-semibold tracking-tight` |
| Section / card title | `text-base font-semibold` |
| Body | `text-sm` |
| Secondary / table | `text-[13px]` |
| Label / badge / meta | `text-xs font-medium` |
| Metric value | `font-mono text-lg font-medium tabular-nums` |
| Hero metric (overview) | `font-mono text-2xl font-medium tabular-nums` |
| Code / log line | `font-mono text-[13px]` |

## Layout

- **App shell:** fixed left sidebar `w-56`, `bg-surface`, `border-r border-border`; main area `bg-bg`, scrolls independently.
- **Sidebar top:** project switcher (project name + environment badge). Bottom: user email + logout.
- **Page header:** title, optional one-line description; on the right: time-range selector (`15m / 1h / 24h / 7d`) and actions. `px-6 py-5`, bottom border.
- **Content:** `p-6`, blocks `gap-6`, inside cards `gap-3` / `gap-4`.
- **Metric row:** `grid grid-cols-2 lg:grid-cols-4 gap-2.5`.
- **Detail screens** (trace, incident, error): main column `flex-1` + right panel `w-[400px]`, separated by a 1px border. Below `1024px` the panel stacks.
- **Collections** are tables / row lists, never card grids.
- Forms max `max-w-[720px]`.
- Spacing steps: 1, 2, 3, 4, 5, 6, 8, 12.

## Elevation & Shapes

- Flat. Depth from tonal layers (`bg` → `surface` → `surface-2`) and 1px borders. Shadows only on floating layers: `shadow-lg shadow-black/40 border-border-strong`.
- Radii: `rounded` (chips), `rounded-md` (buttons, inputs, nav), `rounded-lg` (stat cards, code), `rounded-xl` (cards, dialogs), `rounded-full` (badges, dots). Max 12px.
- Icons: `lucide-react`, `size-4`, `strokeWidth={1.75}`, `text-fg-muted` unless they signal state.

## Components

**Sidebar nav.** Overview, Services, Errors, Logs, Traces, Metrics, Incidents, Deployments, AI Analysis, Alerts, Settings. `text-sm text-fg-muted rounded-md px-2.5 py-1.5`; hover `bg-surface-hover text-fg`; active `bg-surface-2 text-fg`. Incidents and Errors show a count pill (`bg-danger/15 text-danger text-[11px] rounded-full px-1.5`) only when open count > 0.

**Buttons.** `h-[34px] rounded-md px-3.5 text-sm font-medium`.
- Primary `bg-accent text-white hover:bg-accent-hover`, one per region.
- Secondary `bg-surface-2 border border-border hover:bg-surface-hover`.
- Danger: secondary chrome + `text-danger`, always confirmed.
- Ghost `text-fg-muted hover:text-fg hover:bg-surface-hover`.
- Focus `focus-visible:outline-2 outline-offset-2 outline-accent`. Disabled `opacity-50 cursor-not-allowed`.

**Status badge.** `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium` + 6px dot, colours from the state table.

**Stat card.** `bg-surface border border-border rounded-lg px-3 py-2.5`. Label `text-xs text-fg-muted`, value metric style, optional delta below (`text-xs font-mono`, `danger` when worse, `success` when better, `fg-muted` when flat).

**Card.** `bg-surface border border-border rounded-xl p-[18px]`, title row on top.

**Table.** `text-[13px]`. Header `text-xs font-medium text-fg-muted border-b border-border`. Rows `py-2.5 border-b border-border hover:bg-surface-hover`, whole row clickable. IDs, timestamps, durations mono.

**Inputs / select / textarea.** `bg-bg border border-border-strong rounded-md h-[34px] px-2.5 text-sm placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25`. Label `text-[13px] font-medium`, help `text-xs text-fg-muted`, error `text-xs text-danger`.

**Time-series chart.** Inline SVG, no chart library. Grid lines `stroke-border`, axis labels `text-[11px] fill-fg-muted font-mono`. Requests series `accent`, errors `danger`, latency `accent` (P95 solid, P50 at 50% opacity). Area fill at 10% alpha. Deployments: vertical dashed `fg-muted` line with a small version label on top. Hover shows a `surface-2` tooltip with mono values.

**Trace waterfall.** Rows: grid `220px 1fr 64px`. Left: service (mono, muted) + operation (mono). Middle: bar positioned by offset/duration on a shared time axis, `h-2 rounded-sm`, `bg-accent` or `bg-danger` for error spans. The slowest span's bar is full opacity, others 70%. Right: duration mono. Selected row `bg-surface-hover`; details in the right panel.

**Log row.** Grid `96px 56px 140px 1fr`: time (mono, muted), level (mono, uppercase, level colour), service (mono, muted), message (mono, `fg`). ERROR / FATAL rows get a 2px left bar in the level colour. Click expands metadata as a JSON block.

**JSON / code block.** `bg-surface-2 border border-border rounded-lg p-3 font-mono text-[13px] overflow-auto`.

**AI analysis.** Rendered as structured sections, not chat bubbles: Summary, Evidence (each item links to the source: error, trace, log, deployment), Potential causes (labelled "Hypothesis"), Suggested investigation. Facts and hypotheses must look different: hypotheses get a `warning` "Hypothesis" chip.

**Empty state.** Centred muted 24px icon, one line `text-sm text-fg`, one muted explanation, one primary action.

**Motion.** 150ms `ease-out` for hover/colour; new live rows fade in over 200ms; pulse only on dots. Respect `prefers-reduced-motion`.

## Do's and Don'ts

**Do**
- Show backend state verbatim, with colour, indicator and label from the state table.
- Use mono for every machine value.
- Link every correlated entity (error → trace → logs → service → deployment).
- Keep screens dense and aligned.

**Don't**
- No gradients, glows, glass, "AI sparkle" icons.
- No colour on decoration.
- No shadows on in-flow cards, no radius above 12px.
- No more than one primary button per region.
- No `fg-subtle` text the user must read.
- No chat bubbles for AI analysis (the incident chat uses plain rows with a role label).
