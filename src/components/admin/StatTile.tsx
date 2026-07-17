export default function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-fg">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted/70">{hint}</p>}
    </div>
  );
}
