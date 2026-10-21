import { createHash } from "node:crypto";

// Each worktree gets a stable port in 3100-3899 so parallel worktrees don't collide.
function worktreePort(): number {
  if (process.env.E2E_PORT) return Number(process.env.E2E_PORT);
  const hash = createHash("sha256").update(process.cwd()).digest();
  const port = 3100 + (hash.readUInt32BE(0) % 800);
  // Chrome refuses to connect to 3659 (ERR_UNSAFE_PORT); it is the only blocked port in range.
  return port === 3659 ? 3660 : port;
}

export const port = worktreePort();
export const baseURL = `http://127.0.0.1:${port}`;

// The build pretends it is this moment, so the data in src/data has a fixed current banner:
// HSR 4.6 phase 1 (America server) and ZZZ 3.3 phase 1.
export const BUILD_NOW = "2026-10-21T12:00:00Z";
