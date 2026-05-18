"use client";

import { useState } from "react";

export function ScannerTabs({
  fileLabel,
  iocLabel,
  fileTab,
  iocTab,
}: {
  fileLabel: string;
  iocLabel: string;
  fileTab: React.ReactNode;
  iocTab: React.ReactNode;
}) {
  const [active, setActive] = useState<"file" | "ioc">("file");

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex gap-2 border-b border-[color:var(--border)] text-sm">
        <TabButton active={active === "file"} onClick={() => setActive("file")}>
          {fileLabel}
        </TabButton>
        <TabButton active={active === "ioc"} onClick={() => setActive("ioc")}>
          {iocLabel}
        </TabButton>
      </nav>
      {active === "file" ? fileTab : iocTab}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 ${
        active
          ? "border-[color:var(--accent)] text-[color:var(--foreground)]"
          : "border-transparent text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
