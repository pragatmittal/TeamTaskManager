import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios.js';
import TaskCard from '../components/TaskCard.jsx';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (projectFilter) params.set('project', projectFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (assignedFilter) params.set('assignedTo', assignedFilter);
      const qs = params.toString();
      const res = await api.get(qs ? `/tasks?${qs}` : '/tasks');
      setTasks(res.data.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectFilter, statusFilter, assignedFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All tasks</h1>
        <p className="text-slate-400">Filter across every project (admin view).</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div>
          <label className="block text-xs text-slate-500">Project ID</label>
          <input
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            placeholder="Mongo ObjectId"
            className="mt-1 w-56 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
          >
            <option value="">All</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Assigned user ID</label>
          <input
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            placeholder="Mongo ObjectId"
            className="mt-1 w-56 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading tasks…</p>
      ) : tasks.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((t) => (
            <TaskCard key={t._id} task={t} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500">No tasks match your filters.</p>
      )}
    </div>
  );
}
