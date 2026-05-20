export default function StatusBadge({ status }) {
  const map = {
    todo: 'bg-slate-700 text-slate-100',
    'in-progress': 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    done: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  };
  const label = status === 'in-progress' ? 'In progress' : status;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-slate-700'}`}>
      {label}
    </span>
  );
}
