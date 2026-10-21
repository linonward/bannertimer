"use client";

import { useState } from "react";

export type ArchiveRow = {
  key: string;
  version: string;
  dates: string;
  half: string;
  five: string[];
  four: string[];
  rerun: boolean;
  /** Set once the version page exists (docs/product.md §14 item 5). */
  href?: string;
};

// docs/product.md §5 module 4: newest first, filterable by character name.
export function ArchiveTable({ rows }: { rows: ArchiveRow[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? rows.filter((r) => [...r.five, ...r.four].some((name) => name.toLowerCase().includes(needle)))
    : rows;

  return (
    <div>
      <label className="mb-3 block text-sm">
        Filter by character{" "}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-2 rounded border border-line bg-surface px-2 py-1"
        />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2 pr-3">Version</th>
              <th className="py-2 pr-3">Dates</th>
              <th className="py-2 pr-3">Half</th>
              <th className="py-2 pr-3">5★</th>
              <th className="py-2 pr-3">4★</th>
              <th className="py-2">Rerun</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.key} className="border-t border-line align-top">
                <td className="py-2 pr-3 font-semibold">{r.href ? <a href={r.href}>{r.version}</a> : r.version}</td>
                <td className="py-2 pr-3">{r.dates}</td>
                <td className="py-2 pr-3">{r.half}</td>
                <td className="py-2 pr-3">{r.five.join(", ")}</td>
                <td className="py-2 pr-3">{r.four.join(", ")}</td>
                <td className="py-2">{r.rerun ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="py-3 text-sm text-muted">No past banner features that character.</p>}
      </div>
    </div>
  );
}
