export default function AuditBadge({ actor }) {
  return (
    <span className="inline-block text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
      {actor}
    </span>
  );
}