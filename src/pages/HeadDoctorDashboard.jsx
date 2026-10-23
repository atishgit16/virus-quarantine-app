import { useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { todayISO } from '../utils/dateHelpers';

export default function HeadDoctorDashboard() {
  const { user } = useAuth();
  const {
    patients,
    temperatures,
    audit,
    getTodayTemp,
    overrideRecord,
    resetDemo,
  } = useData();

  const [overrideAction, setOverrideAction] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverride, setShowOverride] = useState(false);

  const today = todayISO();

  const stats = useMemo(() => {
    const active = patients.filter((p) => p.status === 'active');
    const deceased = patients.filter((p) => p.status === 'deceased').length;
    const discharged = patients.filter((p) => p.status === 'discharged').length;
    const totalOutcomes = deceased + discharged;
    const mortalityRate = totalOutcomes === 0 ? 0 : (deceased / totalOutcomes) * 100;

    const activeWithTempToday = active.filter((p) => getTodayTemp(p.id)).length;
    const tempCompliance = active.length === 0 ? 0 : (activeWithTempToday / active.length) * 100;

    const activeWithVisitToday = active.filter((p) => p.lastVisitAt?.slice(0, 10) === today).length;
    const visitCompliance = active.length === 0 ? 0 : (activeWithVisitToday / active.length) * 100;

    const awaitingDischarge = active.filter((p) => p.dischargeRequested).length;

    return {
      activeCount: active.length,
      deceased,
      discharged,
      mortalityRate,
      tempCompliance,
      visitCompliance,
      awaitingDischarge,
    };
  }, [patients, getTodayTemp, today]);

  const submitOverride = () => {
    if (overrideReason.trim().length < 5) {
      alert('Please provide a clear reason (min 5 chars).');
      return;
    }
    overrideRecord({ actor: user?.role, action: overrideAction || 'general', reason: overrideReason.trim() });
    setOverrideAction('');
    setOverrideReason('');
    setShowOverride(false);
  };

  return (
    <AppLayout title="Head Doctor / Quality Lead">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Active patients" value={stats.activeCount} />
        <Metric
          label="Mortality rate"
          value={`${stats.mortalityRate.toFixed(1)}%`}
          tone={stats.mortalityRate > 15 ? 'red' : 'green'}
          note="Target ≤ 15%"
        />
        <Metric
          label="Temp compliance (today)"
          value={`${stats.tempCompliance.toFixed(0)}%`}
          tone={stats.tempCompliance < 100 ? 'amber' : 'green'}
        />
        <Metric
          label="Doctor-visit compliance"
          value={`${stats.visitCompliance.toFixed(0)}%`}
          tone={stats.visitCompliance < 100 ? 'amber' : 'green'}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Metric label="Awaiting discharge" value={stats.awaitingDischarge} />
        <Metric label="Discharged (total)" value={stats.discharged} />
        <Metric label="Deceased (total)" value={stats.deceased} tone={stats.deceased > 0 ? 'red' : 'default'} />
        <Metric label="Success vs 85% benchmark" value={`${(100 - stats.mortalityRate).toFixed(1)}%`} tone={100 - stats.mortalityRate >= 85 ? 'green' : 'amber'} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700">Audit log</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowOverride(true)} className="px-3 py-1.5 rounded bg-amber-500 text-white text-xs">
            Log override
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to seed values?')) resetDemo();
            }}
            className="px-3 py-1.5 rounded bg-slate-800 text-white text-xs"
          >
            Reset demo data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">When</th>
              <th className="text-left px-3 py-2">Actor</th>
              <th className="text-left px-3 py-2">Action</th>
              <th className="text-left px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {audit.slice(0, 50).map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-1.5 text-slate-500">{new Date(a.at).toLocaleString()}</td>
                <td className="px-3 py-1.5">{a.actor}</td>
                <td className="px-3 py-1.5">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    a.action.startsWith('OVERRIDE') ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {a.action}
                  </span>
                </td>
                <td className="px-3 py-1.5">{a.detail}</td>
              </tr>
            ))}
            {audit.length === 0 && (
              <tr>
                <td className="px-3 py-2 text-slate-400" colSpan={4}>No audit entries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-5 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold">Log override (audited)</h2>
              <button onClick={() => setShowOverride(false)}>✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-sm mb-1">Action being overridden</label>
                <input
                  value={overrideAction}
                  onChange={(e) => setOverrideAction(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. discharge-block, temp-correction"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Reason (required)</label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setShowOverride(false)} className="px-3 py-1.5 rounded bg-slate-200 text-sm">
                Cancel
              </button>
              <button onClick={submitOverride} className="px-3 py-1.5 rounded bg-amber-500 text-white text-sm">
                Log override
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Metric({ label, value, tone = 'default', note }) {
  const toneMap = {
    default: 'text-slate-900',
    green: 'text-green-700',
    red: 'text-red-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${toneMap[tone]}`}>{value}</div>
      {note && <div className="text-[10px] text-slate-400 mt-1">{note}</div>}
    </div>
  );
}