import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
  }`;

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900/40 p-4">
      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={linkClass}>
          Projects
        </NavLink>
        {isAdmin ? (
          <NavLink to="/tasks" end className={linkClass}>
            All tasks
          </NavLink>
        ) : null}
      </nav>
    </aside>
  );
}
