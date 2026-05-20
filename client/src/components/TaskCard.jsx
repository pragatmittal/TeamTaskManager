import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';

export default function TaskCard({ task }) {
  const overdue = task.isOverdue || (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done');
  return (
    <Link
      to={`/tasks/${task._id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-600"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-white">{task.title}</h3>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
      {task.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-400">{task.description}</p> : null}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span>Project: {task.project?.title || '—'}</span>
        <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
        {task.dueDate ? (
          <span className={overdue ? 'font-medium text-rose-400' : ''}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {overdue ? ' (overdue)' : ''}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
