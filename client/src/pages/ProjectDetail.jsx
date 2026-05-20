import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [memberModal, setMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });
  const [savingMember, setSavingMember] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (e) {
      const msg = getErrorMessage(e);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const params = new URLSearchParams({ project: id });
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) {
        // API does not filter by priority — filter client-side
      }
      const res = await api.get(`/tasks?${params.toString()}`);
      let list = res.data.data;
      if (priorityFilter) {
        list = list.filter((t) => t.priority === priorityFilter);
      }
      setTasks(list);
    } catch (e) {
      const msg = getErrorMessage(e);
      toast.error(msg);
    } finally {
      setTasksLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (!project) return;
    loadTasks();
  }, [id, project, statusFilter, priorityFilter]);

  useEffect(() => {
    if (memberModal) loadUsers();
  }, [memberModal, isAdmin]);

  const memberOptions = useMemo(() => {
    if (!project) return users;
    const ids = new Set(project.members.map((m) => (m._id || m).toString()));
    return users.filter((u) => !ids.has(u._id));
  }, [users, project]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setSavingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserId });
      toast.success('Member added');
      setMemberModal(false);
      setSelectedUserId('');
      await loadProject();
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingMember(false);
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      await loadProject();
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setSavingTask(true);
    try {
      const body = {
        title: taskForm.title,
        description: taskForm.description,
        project: id,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
      };
      if (taskForm.assignedTo) body.assignedTo = taskForm.assignedTo;
      await api.post('/tasks', body);
      toast.success('Task created');
      setTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      });
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingTask(false);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm('Delete this project and all of its tasks?')) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="text-slate-400">Loading project…</p>;
  if (error || !project) return <p className="text-rose-400">{error || 'Project not found.'}</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm text-indigo-400 hover:underline">
            ← Back to projects
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-white">{project.title}</h1>
          {project.description ? <p className="mt-2 max-w-3xl text-slate-400">{project.description}</p> : null}
          <p className="mt-3 text-sm text-slate-500">
            Owner: <span className="text-slate-300">{project.owner?.name}</span> ({project.owner?.email})
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMemberModal(true)}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800"
            >
              Add member
            </button>
            <button
              type="button"
              onClick={() => setTaskModal(true)}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create task
            </button>
            <button
              type="button"
              onClick={deleteProject}
              disabled={deleting}
              className="rounded-lg border border-rose-500/50 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        ) : null}
      </div>

      <section>
        <h2 className="text-lg font-semibold text-white">Members</h2>
        <ul className="mt-3 divide-y divide-slate-800 rounded-xl border border-slate-800">
          {project.members?.map((m) => {
            const mid = m._id || m;
            const ownerId = (project.owner?._id || project.owner).toString();
            const isOwner = mid.toString() === ownerId;
            return (
              <li key={mid} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-white">{m.name}</p>
                  <p className="text-slate-500">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <span className="text-xs text-amber-300">Owner</span>
                  ) : isAdmin ? (
                    <button
                      type="button"
                      onClick={() => removeMember(mid)}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Tasks</h2>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-slate-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
              >
                <option value="">All</option>
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
              >
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>
        {tasksLoading ? (
          <p className="text-slate-400">Loading tasks…</p>
        ) : tasks.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No tasks match these filters.</p>
        )}
      </section>

      {memberModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={addMember}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h3 className="text-lg font-semibold text-white">Add member</h3>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="">Select user</option>
              {memberOptions.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setMemberModal(false)} className="text-sm text-slate-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingMember}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingMember ? 'Adding…' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {taskModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={createTask} className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">New task</h3>
            <div>
              <label className="text-sm text-slate-300">Title</label>
              <input
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Assignee</label>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="">Unassigned</option>
                  {project.members?.map((m) => (
                    <option key={m._id || m} value={m._id || m}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300">Due date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTaskModal(false)} className="text-sm text-slate-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTask}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingTask ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
