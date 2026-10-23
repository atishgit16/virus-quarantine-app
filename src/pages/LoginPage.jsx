import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { ROLE_HOME, ROLE_LABELS, ROLES } from '../utils/permissions';

const ROLE_META = {
  [ROLES.NURSE]: { icon: '', desc: 'Record temperatures · track fever streaks' },
  [ROLES.DOCTOR]: { icon: '', desc: 'Round visits · treatment · discharge requests' },
  [ROLES.ADMIN]: { icon: '', desc: 'Admit · occupancy · process discharges' },
  [ROLES.HEAD_DOCTOR]: { icon: '', desc: 'Quality metrics · overrides · audit log' },
  [ROLES.SYS_ADMIN]: { icon: '', desc: 'User management · data exports' },
};

export default function LoginPage() {
  const { authenticate, user, logout } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!role) {
      setError('Please select a role.');
      return;
    }
    const res = authenticate(role, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(ROLE_HOME[role], { replace: true });
  };

  const quickLogin = (quickRole) => {
    const res = authenticate(quickRole, DEMO_CREDENTIALS[quickRole].password);
    if (res.ok) navigate(ROLE_HOME[quickRole], { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-3 mb-14">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-xl">
                🏥
              </div>
              <div>
                <div className="font-semibold tracking-tight">Quarantine Facility</div>
                <div className="text-xs text-white/60">Operations Platform</div>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Care coordination<br />for a safer facility.
            </h1>
            <p className="text-white/70 max-w-sm leading-relaxed">
              One shared workspace for nurses, doctors, and administrators.
              Real-time temperature tracking, discharge gating, and quality
              oversight — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard value="74" label="Bed capacity" />
            <StatCard value="15%" label="Mortality threshold" />
            <StatCard value="3d" label="Fever-free rule" />
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">🏥</div>
            <div className="font-semibold text-slate-900">Quarantine Facility</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Access your role-specific dashboard.
            </p>

            {user && (
              <div className="mb-5 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 text-sm flex items-center justify-between">
                <span>
                  Signed in as <strong>{ROLE_LABELS[user.role]}</strong>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-blue-700 hover:underline text-xs font-medium"
                >
                  Sign out
                </button>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your role…</option>
                  {Object.values(ROLES).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_META[r].icon}  {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                {role && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    {ROLE_META[role].desc}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {showPasswords ? 'Hide' : 'Show'} demo passwords
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {showPasswords && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 space-y-1 font-mono">
                    {Object.values(ROLES).map((r) => (
                      <div key={r} className="flex justify-between">
                        <span className="text-slate-600">{ROLE_LABELS[r]}</span>
                        <span className="text-slate-800">{DEMO_CREDENTIALS[r].password}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg py-2.5 text-sm transition"
              >
                Sign in
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 tracking-wider">
                  or quick demo access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(ROLES).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => quickLogin(r)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs text-slate-700 transition text-left"
                >
                  <span>{ROLE_META[r].icon}</span>
                  <span className="truncate">{ROLE_LABELS[r].split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6 text-center">
            Prototype · data is stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}