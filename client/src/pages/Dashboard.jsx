import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios.js';
import TaskCard from '../components/TaskCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/50 p-4 ${accent || ''}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/dashboard');
        if (!cancelled) setData(res.data.data);
      } catch (e) {
        const msg = getErrorMessage(e);
        if (!cancelled) setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-slate-400">Loading dashboard…</p>;
  }
  if (error || !data) {
    return <p className="text-rose-400">{error || 'Unable to load dashboard.'}</p>;
  }

  const inProgress = data.tasksByStatus['in-progress'] ?? 0;
  const done = data.tasksByStatus.done ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Overview of projects and tasks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={data.totalProjects} />
        <StatCard label="Total tasks" value={data.totalTasks} />
        <StatCard label="In progress" value={inProgress} accent="border-amber-500/30" />
        <StatCard label="Done" value={done} accent="border-emerald-500/30" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Overdue tasks</h2>
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-200">
            {data.overdueTasks?.length || 0}
          </span>
        </div>
        {data.overdueTasks?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.overdueTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No overdue tasks. Nice work.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">My tasks</h2>
        {data.myTasks?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.myTasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No tasks assigned to you.</p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent projects</h2>
          <Link to="/projects" className="text-sm text-indigo-400 hover:underline">
            View all
          </Link>
        </div>
        {data.recentProjects?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.recentProjects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No projects yet.</p>
        )}
      </section>
    </div>
  );
}
