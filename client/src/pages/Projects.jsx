import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [formErrors, setFormErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
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
  }, []);

  const openModal = () => {
    setForm({ title: '', description: '' });
    setFormErrors([]);
    setModalOpen(true);
  };

  const createProject = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setSaving(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setModalOpen(false);
      await load();
    } catch (err) {
      const msg = getErrorMessage(err);
      setFormErrors(err.response?.data?.details || [msg]);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-400">Loading projects…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400">Spaces you belong to or manage.</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={openModal}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create project
          </button>
        ) : null}
      </div>

      {error ? <p className="text-rose-400">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p._id} project={p} />
        ))}
      </div>
      {!projects.length ? <p className="text-slate-500">No projects to show.</p> : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">New project</h2>
            <form onSubmit={createProject} className="mt-4 space-y-4">
              {formErrors.length ? (
                <ul className="list-inside list-disc text-sm text-rose-300">
                  {formErrors.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              ) : null}
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
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
