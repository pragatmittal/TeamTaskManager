import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <Link to="/dashboard" className="text-lg font-semibold text-white">
        Team Task Manager
      </Link>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm">
          <p className="font-medium text-white">{user?.name}</p>
          <p className="text-xs capitalize text-slate-500">{user?.role}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
            user?.role === 'admin' ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700 text-slate-200'
          }`}
        >
          {user?.role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
