import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className="block rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-indigo-500/50"
    >
      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
      {project.description ? <p className="mt-2 line-clamp-3 text-sm text-slate-400">{project.description}</p> : null}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <span>Owner: {project.owner?.name || '—'}</span>
        <span>{project.members?.length || 0} members</span>
      </div>
    </Link>
  );
}
