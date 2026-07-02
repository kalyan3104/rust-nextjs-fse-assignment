"use client";

import { useState } from "react";

export function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — fail silently, value is still selectable
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={copy}
        title="Click to copy"
        className="group flex items-center justify-between gap-2 rounded-sm border border-base-border bg-base-bg px-3 py-2 text-left font-mono text-sm text-ink hover:border-signal-accent/50"
      >
        <span className="break-all">{value}</span>
        <span className="shrink-0 text-xs text-ink-faint group-hover:text-signal-accent">
          {copied ? "copied" : "copy"}
        </span>
      </button>
    </div>
  );
}
