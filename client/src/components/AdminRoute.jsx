import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">Loading…</div>
    );
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
