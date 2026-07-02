"use client";

import { useState } from "react";

export interface Filters {
  subject: string;
  issuer: string;
  expiringWithinDays: string;
}

export function FilterBar({
  initial,
  onApply,
}: {
  initial: Filters;
  onApply: (filters: Filters) => void;
}) {
  const [subject, setSubject] = useState(initial.subject);
  const [issuer, setIssuer] = useState(initial.issuer);
  const [expiringWithinDays, setExpiringWithinDays] = useState(initial.expiringWithinDays);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onApply({ subject, issuer, expiringWithinDays });
  }

  function reset() {
    setSubject("");
    setIssuer("");
    setExpiringWithinDays("");
    onApply({ subject: "", issuer: "", expiringWithinDays: "" });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 border-b border-base-border bg-base-panel px-4 py-3"
    >
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-muted">Subject contains</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="example.com"
          className="w-48 rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-muted">Issuer contains</span>
        <input
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="Let's Encrypt"
          className="w-48 rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-muted">Expiring within (days)</span>
        <input
          value={expiringWithinDays}
          onChange={(e) => setExpiringWithinDays(e.target.value.replace(/\D/g, ""))}
          placeholder="30"
          inputMode="numeric"
          className="w-32 rounded-sm border border-base-border bg-base-bg px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-sm bg-signal-accent px-3 py-1.5 text-xs font-semibold text-base-bg hover:opacity-90"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-sm border border-base-border px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-base-panel2"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
