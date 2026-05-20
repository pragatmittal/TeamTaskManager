import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tasks/${id}`);
      const t = res.data.data;
      setTask(t);
      setForm({
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
        assignedTo: t.assignedTo?._id || t.assignedTo || '',
      });
      if (t.project?._id) {
        try {
          const pr = await api.get(`/projects/${t.project._id}`);
          setProject(pr.data.data);
        } catch {
          setProject(null);
        }
      }
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const overdue =
    task &&
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const saveAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        assignedTo: form.assignedTo || null,
      };
      await api.patch(`/tasks/${id}`, body);
      toast.success('Task updated!');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateMemberStatus = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/tasks/${id}`, { status });
      toast.success('Status updated');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async () => {
    if (!window.confirm('Delete this task permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      if (task?.project?._id) {
        navigate(`/projects/${task.project._id}`, { replace: true });
      } else {
        navigate('/tasks', { replace: true });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-slate-400">Loading task…</p>;
  if (error || !task) return <p className="text-rose-400">{error || 'Task not found.'}</p>;

  const assigneeId = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
  const isAssignee = assigneeId === user?._id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to={task.project?._id ? `/projects/${task.project._id}` : '/projects'}
        className="text-sm text-indigo-400 hover:underline"
      >
        ← Back to project
      </Link>

      {overdue ? (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
          OVERDUE — due {new Date(task.dueDate).toLocaleDateString()}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{task.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={removeTask}
            disabled={deleting}
            className="rounded-lg border border-rose-500/50 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete task'}
          </button>
        ) : null}
      </div>

      {task.description ? <p className="text-slate-300">{task.description}</p> : null}

      <dl className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Project</dt>
          <dd className="font-medium text-white">{task.project?.title || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Due date</dt>
          <dd className="font-medium text-white">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Assignee</dt>
          <dd className="font-medium text-white">{task.assignedTo?.name || 'Unassigned'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Created by</dt>
          <dd className="font-medium text-white">{task.createdBy?.name || '—'}</dd>
        </div>
      </dl>

      {!isAdmin && isAssignee ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <label className="block text-sm font-medium text-slate-300">Update status</label>
          <select
            value={task.status}
            disabled={saving}
            onChange={(e) => updateMemberStatus(e.target.value)}
            className="mt-2 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      ) : null}

      {isAdmin ? (
        <form onSubmit={saveAdmin} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Edit task</h2>
          <div>
            <label className="text-sm text-slate-300">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Assignee</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="">Unassigned</option>
                {project?.members?.map((m) => (
                  <option key={m._id || m} value={m._id || m}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      ) : null}

      {!isAdmin && !isAssignee ? (
        <p className="text-sm text-slate-500">You can view this task but only the assignee may change its status.</p>
      ) : null}
    </div>
  );
}
