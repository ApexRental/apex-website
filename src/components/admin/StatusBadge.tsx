export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "border-accent/50 bg-accent-dim text-accent-bright",
    CONFIRMED: "border-success/40 bg-success/10 text-success",
    ACTIVE: "border-warning/40 bg-warning/10 text-warning",
    COMPLETED: "border-line bg-raised text-muted",
    CANCELLED: "border-danger/40 bg-danger/10 text-danger",
  };
  return (
    <span
      className={`shrink-0 rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${styles[status] ?? styles.COMPLETED}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
