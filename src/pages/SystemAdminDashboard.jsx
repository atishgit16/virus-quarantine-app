import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ROLE_LABELS } from '../utils/permissions';

export default function SystemAdminDashboard() {
  const { user } = useAuth();
  const { audit, resetDemo } = useData();
  const [exported, setExported] = useState(false);

  const exportAudit = () => {
    const dataStr = JSON.stringify(audit, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <AppLayout title="System Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-800 mb-2">Roles in prototype</h2>
          <ul className="text-sm text-slate-600 space-y-1">
            {Object.values(ROLE_LABELS).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="font-semibold text-slate-800 mb-2">Data tools</h2>
          <p className="text-xs text-slate-500 mb-3">
            System Admin cannot make clinical decisions. Use these tools for operations and audit.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportAudit}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              Export audit log (JSON)
            </button>
            <button
              onClick={() => {
                if (window.confirm('This will wipe all demo data and restore seed values. Continue?')) {
                  resetDemo();
                }
              }}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Reset demo data
            </button>
          </div>
          {exported && <div className="text-xs text-green-700 mt-2">Export downloaded.</div>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="font-semibold text-slate-800 mb-2">Recent audit entries ({audit.length})</h2>
        <div className="max-h-80 overflow-y-auto divide-y text-sm">
          {audit.slice(0, 30).map((a) => (
            <div key={a.id} className="py-2 flex justify-between">
              <span>
                <span className="text-slate-500 mr-2">{new Date(a.at).toLocaleTimeString()}</span>
                <strong>{a.actor}</strong>: {a.action}
              </span>
              <span className="text-slate-500 truncate ml-4">{a.detail}</span>
            </div>
          ))}
          {audit.length === 0 && <div className="py-2 text-slate-400">No entries yet.</div>}
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-4">Signed in as {user?.role}</div>
    </AppLayout>
  );
}