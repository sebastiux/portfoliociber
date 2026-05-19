"use client";

import { useEffect, useState } from "react";

type Props = {
  yaraTabLabel: string;
  kqlTabLabel: string;
  yaraCount: number;
  kqlCount: number;
  yaraContent: React.ReactNode;
  kqlContent: React.ReactNode;
};

export function DetectionsTabs({
  yaraTabLabel,
  kqlTabLabel,
  yaraCount,
  kqlCount,
  yaraContent,
  kqlContent,
}: Props) {
  const [active, setActive] = useState<"yara" | "kql">("yara");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      const fromUrl = new URLSearchParams(window.location.search).get("type");
      const fromHash = window.location.hash.replace(/^#/, "").toLowerCase();
      if (fromUrl === "kql" || fromHash === "kql") setActive("kql");
      else if (fromUrl === "yara" || fromHash === "yara") setActive("yara");
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  function pick(target: "yara" | "kql") {
    setActive(target);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("type", target);
    url.hash = "";
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <>
      <nav className="flex gap-2 border-b border-[color:var(--border)] text-sm" role="tablist">
        <Tab
          label={yaraTabLabel}
          count={yaraCount}
          isActive={active === "yara"}
          onSelect={() => pick("yara")}
        />
        <Tab
          label={kqlTabLabel}
          count={kqlCount}
          isActive={active === "kql"}
          onSelect={() => pick("kql")}
        />
      </nav>
      <div hidden={active !== "yara"}>{yaraContent}</div>
      <div hidden={active !== "kql"}>{kqlContent}</div>
    </>
  );
}

function Tab({
  label,
  count,
  isActive,
  onSelect,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 font-mono text-xs uppercase tracking-wider ${
        isActive
          ? "border-[color:var(--accent)] text-[color:var(--foreground)]"
          : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      }`}
    >
      <span>{label}</span>
      <span className="rounded-sm border border-[color:var(--border)] px-1.5 py-0.5 text-[10px]">
        {count}
      </span>
    </button>
  );
}
