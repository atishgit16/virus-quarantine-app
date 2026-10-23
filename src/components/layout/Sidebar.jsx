import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME, ROLE_LABELS } from '../../utils/permissions';

const NAV = [
  { to: '/nurse', label: 'Nurse', role: 'nurse' },
  { to: '/doctor', label: 'Doctor', role: 'doctor' },
  { to: '/admin', label: 'Admin', role: 'admin' },
  { to: '/head-doctor', label: 'Head Doctor', role: 'head_doctor' },
  { to: '/sys-admin', label: 'System Admin', role: 'sys_admin' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-slate-900 text-slate-100 p-4 hidden md:flex flex-col">
      <div className="mb-6">
        <div className="text-lg font-bold">Quarantine</div>
        <div className="text-xs text-slate-400">Facility Ops</div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm ${isActive ? 'bg-slate-700' : 'hover:bg-slate-800'} ${
                user?.role === item.role ? '' : 'opacity-60'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto text-xs text-slate-400">
        {user ? `Signed in as ${ROLE_LABELS[user.role]}` : 'Not signed in'}
        {user && <div className="mt-1">Home: {ROLE_HOME[user.role]}</div>}
      </div>
    </aside>
  );
}