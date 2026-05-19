"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "hp-clicked-v1";
const GLITCH_MS = 1200;

type Props = {
  prompt: string;
  label: string;
  hoverHint: string;
  modalTitle: string;
  lines: string[];
  closeLabel: string;
  closeAriaLabel?: string;
};

export function HoneypotLink({
  prompt,
  label,
  hoverHint,
  modalTitle,
  lines,
  closeLabel,
  closeAriaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    let firstTime = true;
    try {
      firstTime = !localStorage.getItem(STORAGE_KEY);
      if (firstTime) localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // localStorage blocked — still play the joke
    }

    if (firstTime) {
      setGlitch(true);
      document.body.classList.add("hp-glitch");
      window.setTimeout(() => {
        document.body.classList.remove("hp-glitch");
        setGlitch(false);
        setOpen(true);
      }, GLITCH_MS);
    } else {
      setOpen(true);
    }
  }

  useEffect(() => {
    if (!open) {
      setVisibleLines(0);
      return;
    }
    closeButtonRef.current?.focus();
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setVisibleLines(i);
      if (i >= lines.length) window.clearInterval(id);
    }, 140);
    return () => window.clearInterval(id);
  }, [open, lines.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("hp-glitch");
    };
  }, []);

  return (
    <>
      <span className="font-mono text-[11px] text-[color:var(--muted)]">
        {prompt}{" "}
        <a
          href="#free-bitcoin"
          onClick={handleClick}
          title={hoverHint}
          className="text-[color:var(--accent)] underline decoration-dotted underline-offset-2 hover:text-[color:var(--critical)]"
        >
          {label}
        </a>
      </span>

      {glitch && <div aria-hidden className="hp-scanlines" />}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hp-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl rounded-md border border-[color:var(--accent)] bg-[color:var(--background)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-2">
              <span
                id="hp-title"
                className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--accent)]"
              >
                {modalTitle}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={closeAriaLabel ?? closeLabel}
                className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                ×
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-[color:var(--foreground)]">
              {lines.slice(0, visibleLines).join("\n")}
              {visibleLines < lines.length && <span className="hp-cursor">&nbsp;</span>}
            </pre>
            <div className="flex justify-end border-t border-[color:var(--border)] px-4 py-3">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1.5 font-mono text-[11px] hover:border-[color:var(--accent)]"
              >
                {closeLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
