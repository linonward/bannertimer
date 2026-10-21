# Workflow

How a change goes from idea to `main`.

## 1. Slice

- Split the task into vertical slices before coding. Number them `S01`, `S02`, ...
- Each slice is end-to-end, ships on its own, and leaves `main` working.
- Start with the thinnest slice that proves the idea.
- One slice = one worktree = one branch = one PR. If a slice grows, split it.

## 2. Worktree

Never commit to `main`. Create a worktree per slice:

```sh
git switch main && git pull --ff-only
git worktree add ../coloring-pages-<topic> -b <type>/<topic>   # e.g. feat/home-page
cd ../coloring-pages-<topic>
pnpm install
```

Each worktree has its own `node_modules`, so run `pnpm install` in it once.

## 3. Design file

`docs/design/crayprint.pen` holds one board per page **template**, not one per page. A template is a page type with its own layout (docs/product.md §1: build a few templates, then add pages that reuse them).

| Change | Design file |
|---|---|
| New template: a new tool page, a new kind of content page, a new layout | Add a page board first, in the same PR as the code |
| New page on an existing template: another seasonal page, Christmas topic, letter page or blog post | No new board. Add its new tokens (such as a hero color) to Foundation |
| Change to a template's layout or components | Update that template's board in the same PR |
| Copy or images only | No change |

Each template has one board that stands for all its pages:

| Template | Board |
|---|---|
| Home | Home / Name Coloring Pages |
| Tool pages | One board per tool: Name Generator, Photo to Coloring Page, Printable Name Tags, Name Tracing Worksheets |
| Letter page | Letter A Name Coloring Pages |
| Christmas category page (with a topic list) | Christmas Coloring Pages |
| Seasonal category page | Winter Coloring Pages |
| Christmas topic page | Elf Coloring Pages |
| Topic collection page (number, later cat, unicorn, dinosaur; docs/product.md §3.15) | Number Coloring Pages |
| Blog index and article | Blog / Coloring Guides & Activities, Blog / How to Print Coloring Pages |
| About, sign-in, account | About CrayPrint, Sign In, Account |

- Exempt: plain-text legal pages (`/privacy/`, `/terms/`), the 404 page and `/admin/` (not indexed).
- No board yet (2026-10-21): `/christmas-coloring-pages/names/`, whose cards are name pages rather than images. Add a board the next time its template changes.
- Fall, Halloween and Thanksgiving also have boards from before this rule. Keep them in step with Winter when the seasonal template changes, or ask before deleting them.

Edit the design file in the worktree's copy. pen.dev keeps edits in memory until the file is saved, so ask the user to save it, then check `git status` before you commit.

## 4. TDD

Repeat per behavior until the slice is done:

1. **Red**: write one failing test. Confirm it fails for the expected reason.
2. **Green**: write the least code to pass.
3. **Refactor**: clean up with all tests green.

Test through public interfaces. Start bug fixes with a test that reproduces the bug.

## 5. Verify and commit

- Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e`.
- Update docs in the same PR when behavior or commands change.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
- Git hooks (husky, installed by `pnpm install`) check each commit:
  - pre-commit: lint-staged runs `eslint --fix` on the staged files. Imports follow `import/order` (`eslint.config.mjs`); `--fix` sorts them.
  - commit-msg: commitlint rejects messages that aren't Conventional Commits with the types above (`commitlint.config.mjs`).
  - A new worktree gets the hooks once you run `pnpm install` in it. Don't skip them with `--no-verify`.

## 6. Pull request

Rebase on `main`, rerun the checks, then open the PR:

```sh
git fetch origin && git rebase origin/main
git push --force-with-lease -u origin <type>/<topic>
gh pr create --base main --template pull_request_template.md
```

Fill in every section of the [PR template](../.github/pull_request_template.md). Write `N/A` if a section doesn't apply.

CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs lint, typecheck, unit and E2E on every PR and on `main`. A PR that changes only Markdown (`*.md`) skips the `check` and `e2e` jobs; run the checks it affects locally.

A ruleset on `main` requires `check` and `e2e` to pass. It doesn't require the branch to be up to date with `main`, so a green PR can merge after `main` moves.

Both live in the repository settings, not in this repo: the ruleset [`main: required checks`](https://github.com/linonward/coloring-pages/rules/25519622) has no bypass, and **Allow auto-merge** is on (2026-10-21). Without the ruleset, `gh pr merge --auto` merges at once instead of waiting for CI.

**When `main` moves, don't rebase by default.** Rebase (and let CI run again) only if:

- GitHub reports a merge conflict, or
- `main` gained changes to something this PR also depends on: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `src/app/layout.tsx`, a shared component the PR uses, or the same section of `docs/product.md`.

The CI run on `main` after each merge is the check that the merged PRs work together. If it fails, fix `main` before you merge anything else. Only a green `main` deploys: CI then moves the `production` branch, which Cloudflare deploys ([`runbook.md`](runbook.md#deploy)).

## 7. Merge and clean up

Queue the merge as soon as the PR is ready. GitHub squash-merges it when the required checks pass:

```sh
gh pr merge <PR> --squash --auto
```

Several green PRs can merge one after another; `main` CI cancels the older runs and checks the last commit. After the merge, run from the main checkout (`coloring-pages/`):

```sh
git worktree remove ../coloring-pages-<topic>
git branch -D <type>/<topic>              # squash merges need -D
git push origin --delete <type>/<topic>   # skip if already deleted
git switch main && git pull --ff-only
git worktree prune
```

Run `git branch -D` only after the PR shows as merged (`gh pr view <PR> --json state`).
