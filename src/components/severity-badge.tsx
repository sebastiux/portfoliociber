import type { Severity } from "@/lib/detections";

const COLOR: Record<Severity, string> = {
  critical: "text-[color:var(--critical)] border-[color:var(--critical)]",
  high: "text-[color:var(--high)] border-[color:var(--high)]",
  medium: "text-[color:var(--medium)] border-[color:var(--medium)]",
  low: "text-[color:var(--low)] border-[color:var(--low)]",
  info: "text-[color:var(--info)] border-[color:var(--info)]",
};

export function SeverityBadge({ severity, label }: { severity: Severity; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${COLOR[severity]}`}
    >
      {label}
    </span>
  );
}
