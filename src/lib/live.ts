"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_SERVER, isServer, type Server } from "./time";

// The server choice is shared by the header switch and every countdown on the page, and is
// kept in the browser (docs/product.md §4). The prerendered HTML always uses DEFAULT_SERVER.
const SERVER_KEY = "bannertimer:server";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readServer(): Server {
  const saved = localStorage.getItem(SERVER_KEY);
  return isServer(saved) ? saved : DEFAULT_SERVER;
}

export function useServer(): Server {
  return useSyncExternalStore(subscribe, readServer, () => DEFAULT_SERVER);
}

export function chooseServer(server: Server) {
  localStorage.setItem(SERVER_KEY, server);
  for (const listener of listeners) listener();
}

/**
 * The current time, ticking every second. The first render returns `renderedAt` (the build time)
 * so the server HTML and hydration match; `live` turns true once the real clock runs.
 */
export function useNow(renderedAt: number): { now: number; live: boolean } {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // Start the real clock after hydration; it differs from the build time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return { now: now ?? renderedAt, live: now !== null };
}
