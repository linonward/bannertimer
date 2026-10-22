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

`docs/design/bannertimer.pen` holds one board per page **template**, not one per page. A template is a page type with its own layout. `/zzz/` and `/genshin/` reuse the `/hsr/` template, so they get no board of their own. One exception: `/zzz/ — Desktop` stays as a reference board for the `game` theme and a next banner that is already announced. Keep it in step with the `/hsr/` board.

The design is dark only. Colours are `b-*` variables with one theme axis, `game` (`hsr`, `zzz`, `genshin`). Set it on the page board's root frame.

| Change | Design file |
|---|---|
| New template: `maintenance`, `livestream`, a new layout | Add a page board first, in the same PR as the code |
| New page on an existing template: another game, another version, a language copy | No new board. Add its new tokens (such as a game accent color) to Foundation |
| Change to a template's layout or components | Update that template's board and the Components frame in the same PR |
| Banner data or copy only | No change |

Top row: the Foundation, Components and Brand frames. Page boards (2026-10-21) sit below them:

| Template | URLs (docs/product.md §3) | Board |
|---|---|---|
| Home | `/` | `/ Home — Desktop` |
| Game page | `/hsr/`, `/zzz/`, later `/genshin/` | `/hsr/ — Desktop`, `/hsr/ — Mobile 390`, `/zzz/ — Desktop` (reference) |
| Version page (M2) | `/{game}/{version}/` | `/zzz/3.3/ — Version Desktop`, drawn ahead of the M2 code. Update it in the M2 PR if the layout changes |
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
- Git hooks (husky, installed by `pnpm install`) check each commit:
  - pre-commit: lint-staged runs `eslint --fix --max-warnings=0` on the staged files.
  - commit-msg: commitlint rejects messages that aren't Conventional Commits with the types above (`commitlint.config.mjs`).
  - A new worktree gets the hooks once you run `pnpm install` in it. If `pnpm install` reports `Already up to date`, it skips `prepare`; run `pnpm run prepare` instead. Don't skip the hooks with `--no-verify`.

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

If a merge starts no CI run on `main` (GitHub sometimes drops the push event; check `gh run list -b main`), run it by hand: `gh workflow run CI --ref main`. It checks and promotes like a push.

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

## 8. Deploy

Cloudflare Workers Builds builds and deploys the `production` branch. CI moves `production` to each green `main` commit (§6); never push it by hand.

- `wrangler.jsonc` serves the Worker on `bannertimer.com` and `www.bannertimer.com` only (custom domains; no `workers.dev`, no preview URLs). `worker.ts` redirects www to the apex before the app runs (`src/lib/canonical-host.ts`).
- Every hour, at minute 5, the Worker's Cron Trigger posts to a Workers Builds deploy hook (`src/lib/rebuild.ts`). The rebuild refreshes the prerendered "current banner" (`docs/product.md` §14 item 2). Without the `DEPLOY_HOOK_URL` secret the cron run does nothing.
- `.node-version` pins Node 24 for Workers Builds, the same as CI.

### One-time setup (Cloudflare dashboard, done by the owner)

1. **Workers & Pages → Create → Import a repository**: pick `linonward/bannertimer`. The Worker name must stay `bannertimer` (`wrangler.jsonc`).
2. **Build settings**:
   - Production branch: `production`
   - Build command: `pnpm exec opennextjs-cloudflare build`
   - Deploy command: `pnpm exec opennextjs-cloudflare deploy`
   - Non-production branch builds: off
   - Do not set `BANNERTIMER_NOW`; it is for tests only.
3. Run the first build (or wait for the next `promote`). Check the build log for the Node and pnpm versions. The custom domains attach on the first deploy.
4. **Settings → Builds → Deploy Hooks**: create a hook named `hourly` for the `production` branch and copy its URL.
5. Store the URL as a Worker secret. The URL is a credential: anyone who has it can start builds.

   ```sh
   pnpm exec wrangler secret put DEPLOY_HOOK_URL
   ```

6. **Google Search Console**: add a Domain property for `bannertimer.com` and verify it with the DNS TXT record (in Cloudflare DNS). Submit `https://bannertimer.com/sitemap.xml`, plus `/hsr/`, `/zzz/` and `/genshin/` `sitemap.xml` (`robots.txt` lists them all).

### Check a deploy

- **Workers & Pages → bannertimer → Deployments** lists each deploy; hook builds show `deploy_hook` as the trigger.
- **Logs** show `Hourly rebuild: triggered` once an hour (`skipped` means the secret is missing).
