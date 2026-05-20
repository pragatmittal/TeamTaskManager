import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
