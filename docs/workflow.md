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
git worktree add ../bannertimer-<topic> -b <type>/<topic>   # e.g. feat/genshin-page
cd ../bannertimer-<topic>
pnpm install
```

Each worktree has its own `node_modules`, so run `pnpm install` in it once. Playwright's Chromium is shared, so `pnpm exec playwright install chromium` is needed once per machine.

`pnpm test:e2e` serves each worktree on its own port (3100–3899, from the worktree path; `e2e/server.ts`), so worktrees can run E2E at the same time. Set `E2E_PORT` to override it.

## 3. Design file

`docs/design/bannertimer.pen` holds one board per page **template**, not one per page. A template is a page type with its own layout. `/zzz/` and `/genshin/` reuse the `/hsr/` template, so they get no board of their own.

| Change | Design file |
|---|---|
| New template: the version page, `maintenance`, `livestream`, a new layout | Add a page board first, in the same PR as the code |
| New page on an existing template: another game, another version, a language copy | No new board. Add its new tokens (such as a game accent color) to Foundation |
| Change to a template's layout or components | Update that template's board and the Components frame in the same PR |
| Banner data or copy only | No change |

Boards (2026-10-21), all in the Pages frame:

| Template | URLs (docs/product.md §3) | Board |
|---|---|---|
| Home | `/` | Home — Desktop 1440 |
| Game page | `/hsr/`, `/zzz/`, later `/genshin/` | HSR — Desktop 1440, HSR — Mobile 390 |
| Version page (M2) | `/{game}/{version}/` | None yet. Add it with the M2 code |
| Maintenance, livestream (M4) | `/{game}/maintenance/`, `/{game}/livestream/` | None yet. Add them with the M4 code |

- Language pages (`/vi/`, `/pt-br/`, `/ko/`, M3) reuse the English template's board.
- Exempt: the 404 page, `robots.txt` and the sitemaps.

Edit the design file in the worktree's copy. pen.dev keeps edits in memory until the file is saved, so ask the user to save it, then check `git status` before you commit.

## 4. TDD

Repeat per behavior until the slice is done:

1. **Red**: write one failing test. Confirm it fails for the expected reason.
2. **Green**: write the least code to pass.
3. **Refactor**: clean up with all tests green.

Test through public interfaces. Start bug fixes with a test that reproduces the bug.

## 5. Verify and commit

- Run `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm test:e2e`. `pnpm test` also checks the banner data against the §4 rules.
- Update docs in the same PR when behavior or commands change.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
- This repo has no Git hooks yet (2026-10-21). Nothing checks a commit before CI, so run the checks above yourself.

## 6. Pull request

Rebase on `main`, rerun the checks, then open the PR:

```sh
git fetch origin && git rebase origin/main
git push --force-with-lease -u origin <type>/<topic>
gh pr create --base main
```

This repo has no PR template yet. In the PR body, write what changed, why, how you verified it, and the reason for each new dependency.

CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) runs lint, typecheck, unit and E2E on every PR and on `main`. A PR that changes only Markdown (`*.md`) skips the `check` and `e2e` jobs; run the checks it affects locally.

**Not set up yet (2026-10-21):** `main` has no ruleset or branch protection, and **Allow auto-merge** is off. Both live in the repository settings, not in this repo. Until they are set up:

- `gh pr merge --auto` fails. Wait for `check` and `e2e` to pass, then run `gh pr merge <PR> --squash`.
- Turn on auto-merge only together with a ruleset that requires `check` and `e2e`. Without the ruleset, `gh pr merge --auto` merges at once instead of waiting for CI.
- The ruleset should not require the branch to be up to date with `main`, so a green PR can merge after `main` moves.

**When `main` moves, don't rebase by default.** Rebase (and let CI run again) only if:

- GitHub reports a merge conflict, or
- `main` gained changes to something this PR also depends on: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `wrangler.jsonc`, `src/app/layout.tsx`, `src/data/index.ts`, a shared component in `src/components/` the PR uses, or the same section of `docs/product.md`.

The CI run on `main` after each merge is the check that the merged PRs work together. If it fails, fix `main` before you merge anything else. Only a green `main` deploys: the `promote` job in CI then fast-forwards the `production` branch, and Cloudflare Workers Builds deploys `production`. Never push to `production` by hand.

## 7. Merge and clean up

Once auto-merge and the ruleset are on (§6), queue the merge as soon as the PR is ready. GitHub squash-merges it when the required checks pass:

```sh
gh pr merge <PR> --squash --auto
```

Several green PRs can merge one after another; `main` CI cancels the older runs and checks the last commit. After the merge, run from the main checkout (`bannertimer/`):

```sh
git worktree remove ../bannertimer-<topic>
git branch -D <type>/<topic>              # squash merges need -D
git push origin --delete <type>/<topic>   # skip if already deleted
git switch main && git pull --ff-only
git worktree prune
```

Run `git branch -D` only after the PR shows as merged (`gh pr view <PR> --json state`).
