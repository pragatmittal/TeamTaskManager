export default function PriorityBadge({ priority }) {
  const map = {
    low: 'bg-slate-600/50 text-slate-200',
    medium: 'bg-sky-500/20 text-sky-200 border border-sky-500/30',
    high: 'bg-rose-500/20 text-rose-200 border border-rose-500/40',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${map[priority] || 'bg-slate-700'}`}>
      {priority}
    </span>
  );
}
