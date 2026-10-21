# AGENTS.md

Instructions for AI coding agents working in this repository.

## Rules

- Read the code before you change it. Match its style.
- Keep changes small and on-task. Don't touch unrelated code.
- Justify every new dependency in the PR.
- Never commit secrets or `.env` files.
- Treat [`docs/product.md`](docs/product.md) as the source of truth for pages, URLs, keywords, copy and the data model. Read it before you build a page.
- Don't build anything that depends on an open item in §14 (待定问题) of `docs/product.md`.
- Don't build anything listed in §12 (明确不做).
- Ask first if an ambiguity changes what you'd build.
- Keep doc references one-way. Never create a reference cycle.
- Report what you did and verified. Report failures and skipped steps with output.

## Workflow

Follow [`docs/workflow.md`](docs/workflow.md): slice → worktree `../bannertimer-<topic>` (never commit to `main`) → design file (when a template is added or changed) → TDD → verify → rebase → PR → `gh pr merge --squash --auto` → clean up and sync `main`. One slice is end-to-end, ships on its own, and leaves `main` working.

## Project status

M1 in progress (2026-10-21): `/`, `/hsr/` and `/zzz/` on sample data. The product is a gacha banner countdown and schedule site on `bannertimer.com`, specified in `docs/product.md`.

Planned stack, same as the sibling `coloring-pages` repo: Next.js 16 (App Router, `src/`, TypeScript, Tailwind 4, pnpm), deployed as a Cloudflare Worker with `@opennextjs/cloudflare`. Banner data lives in JSON files in the repo. No database and no sign-in. Ask before adding either.

## Commands

| Task      | Command |
| --------- | ------- |
| Install   | `pnpm install && pnpm exec playwright install chromium` |
| Dev       | `pnpm dev` |
| Build     | `pnpm build` (OpenNext build to `.open-next/`, then the page cache) |
| Preview   | `pnpm preview` (the Worker in `wrangler dev`, as in production) |
| Lint      | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit      | `pnpm test` (`src/**/*.test.ts(x)`, jsdom) |
| E2E       | `pnpm test:e2e` (builds with `BANNERTIMER_NOW` pinned, serves the Worker on a per-worktree port) |

Banner data: one JSON file per version in `src/data/<game>/`, listed in `src/data/index.ts`. `pnpm test` checks the §4 rules.

## Constraints that shape the implementation

From §3, §4, §5 and §7 of the spec:

- **One data source.** Every page renders from the §4 banner data. Never hand-write banner names, dates or lineups in a page or component.
- **Times:** a phase `start`/`end` is either `{ utc }` (one global moment) or `{ serverLocal }` (the same wall-clock time on each server). Server offsets are fixed: America UTC-5, Europe UTC+1, Asia UTC+8. Convert only at display time.
- **`status` is `official` or `leaked`.** No other value, no empty value. `leaked` needs `sourceUrl` and `sourceCheckedAt`.
- **Server-rendered HTML.** The current banner, the answer paragraph under the H1, the timeline and the archive must be in the raw page source. JS may only update the countdown digits.
- **No images for banner data.** The timeline and tables are HTML and CSS.
- **One game per page.** `/hsr/` shows no Genshin or ZZZ banner tables; it only links to them.
- **URLs:** `/{game}/` and `/{game}/{version}/`. No query parameters, no years. Languages use `/vi/`, `/pt-br/`, `/ko/`.
- **Structured data:** `FAQPage` and `BreadcrumbList` only. Never mark a countdown as `Event` or `SpecialAnnouncement`.
- **Title ≤ 60 characters** and never identical to the H1.
- Ad slots have a fixed height. No third-party script on the critical path.
- Don't block search engine user agents.

Assert SEO constraints against the raw HTML from a plain request, not the hydrated DOM.

## Maintaining `docs/product.md`

- Keyword research arrives in rounds (the user pastes results from an external SEO tool). Merge each round into `product.md`. Don't create new docs.
- Before merging, check the new numbers against themselves and against earlier rounds. Record conflicts in the "数据存疑的地方" appendix. Don't silently pick one value.
- The doc is written in Chinese. Keep it that way.

## Reply Style

Agent 回复用户时使用中文，并按 ASD-STE100（Simplified Technical English）的写作规则：

```text
一句话只说一件事；步骤句不超过 20 个字词，说明句不超过 25 个

指令用祈使句，一句一个动作；步骤用编号列表，按执行顺序排列

用主动语态，写清楚谁做什么

一个术语只表示一个意思，同一个东西始终用同一个词

不用成语、比喻、口语和模糊词（如“大概”“一些”）

一段不超过 6 句话

警告和前提条件写在对应步骤之前

代码、命令、文件名、标识符、错误信息保留原文
```

只约束 Agent 对用户的回复。文档、Commit、PR 的写法不变。

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
