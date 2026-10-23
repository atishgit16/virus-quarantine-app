import { useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Modal from '../components/ui/Modal';
import FeverStreakBadge from '../components/patients/FeverStreakBadge';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { calculateFeverFreeStreak, isDischargeEligible } from '../hooks/useFeverStreak';
import { formatDate, isFever, todayISO } from '../utils/dateHelpers';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const {
    patients,
    getTempsForPatient,
    getTodayTemp,
    markDoctorVisit,
    updateTreatment,
    requestDischarge,
    markDeath,
  } = useData();

  const [selected, setSelected] = useState(null);
  const [treatmentDraft, setTreatmentDraft] = useState('');
  const [showDeathConfirm, setShowDeathConfirm] = useState(false);

  const today = todayISO();

  const active = patients.filter((p) => p.status === 'active');
  const ready = useMemo(
    () => active.filter((p) => getTodayTemp(p.id)),
    [active, getTodayTemp]
  );
  const notReady = useMemo(
    () => active.filter((p) => !getTodayTemp(p.id)),
    [active, getTodayTemp]
  );

  const openPatient = (p) => {
    setSelected(p);
    setTreatmentDraft(p.treatment || '');
    setShowDeathConfirm(false);
  };

  const handleMarkVisit = () => {
    if (!selected) return;
    markDoctorVisit({ patientId: selected.id, actor: user?.role });
    alert(`Visit marked for ${selected.name}`);
  };

  const handleSaveTreatment = () => {
    if (!selected) return;
    updateTreatment({ patientId: selected.id, treatment: treatmentDraft, actor: user?.role });
    alert('Treatment updated');
  };

  const handleRequestDischarge = () => {
    if (!selected) return;
    requestDischarge({ patientId: selected.id, actor: user?.role });
    alert(`Discharge requested for ${selected.name}`);
    setSelected({ ...selected, dischargeRequested: true });
  };

  const handleMarkDeath = () => {
    if (!selected) return;
    markDeath({ patientId: selected.id, actor: user?.role });
    setSelected(null);
    setShowDeathConfirm(false);
  };

  const selectedTemps = selected ? getTempsForPatient(selected.id) : [];
  const selectedStreak = selected ? calculateFeverFreeStreak(selectedTemps, today) : 0;
  const dischargeOK = selected ? isDischargeEligible(selectedTemps, today) : false;

  return (
    <AppLayout title="Doctor Dashboard">
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Ready for round ({ready.length})
        </h2>
        {ready.length === 0 ? (
          <div className="text-slate-500 text-sm bg-white rounded p-4 shadow">
            No patients have a temperature recorded today yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ready.map((p) => {
              const todayTemp = getTodayTemp(p.id);
              const streak = calculateFeverFreeStreak(getTempsForPatient(p.id), today);
              return (
                <button
                  key={p.id}
                  onClick={() => openPatient(p)}
                  className="text-left bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.room}</div>
                  </div>
                  <div className={`mt-1 text-sm ${isFever(todayTemp.valueC) ? 'text-red-600 font-semibold' : 'text-green-700'}`}>
                    Today: {todayTemp.valueC}°C {isFever(todayTemp.valueC) && '⚠ Fever'}
                  </div>
                  <div className="mt-2"><FeverStreakBadge streak={streak} /></div>
                  {p.dischargeRequested && (
                    <div className="mt-2 text-xs text-blue-600">Discharge requested</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Awaiting nurse temperature ({notReady.length})
        </h2>
        {notReady.length === 0 ? (
          <div className="text-slate-500 text-sm bg-white rounded p-4 shadow">
            All active patients have a temperature recorded today.
          </div>
        ) : (
          <div className="bg-white rounded shadow divide-y">
            {notReady.map((p) => (
              <div key={p.id} className="px-4 py-2 flex items-center justify-between text-sm">
                <span>{p.name} <span className="text-slate-400">({p.room})</span></span>
                <span className="text-slate-400 text-xs">Blocked — waiting on nurse</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={!!selected}
        title={selected ? `Clinical detail — ${selected.name}` : ''}
        onClose={() => setSelected(null)}
        footer={
          <>
            <button
              onClick={() => setShowDeathConfirm(true)}
              className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Mark Death
            </button>
            <button onClick={() => setSelected(null)} className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-sm">
              Close
            </button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-500">Room</div>
                <div className="font-medium">{selected.room}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Admitted</div>
                <div className="font-medium">{formatDate(selected.admittedAt)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Fever-free streak</div>
                <FeverStreakBadge streak={selectedStreak} />
              </div>
              <div>
                <div className="text-xs text-slate-500">Discharge eligible</div>
                <div className={`font-medium ${dischargeOK ? 'text-green-700' : 'text-slate-500'}`}>
                  {dischargeOK ? 'Yes (3+ days)' : 'No'}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Recent temperatures</div>
              <div className="border rounded divide-y max-h-32 overflow-y-auto">
                {selectedTemps.length === 0 && (
                  <div className="px-3 py-2 text-slate-400">No readings yet.</div>
                )}
                {selectedTemps.slice(0, 8).map((t) => (
                  <div key={t.id} className="px-3 py-1.5 flex justify-between">
                    <span>{formatDate(t.date)}</span>
                    <span className={isFever(t.valueC) ? 'text-red-600 font-semibold' : 'text-green-700'}>
                      {t.valueC}°C
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1">Treatment notes</label>
              <textarea
                value={treatmentDraft}
                onChange={(e) => setTreatmentDraft(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveTreatment}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs"
                >
                  Save treatment
                </button>
                <button
                  onClick={handleMarkVisit}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  Mark daily visit
                </button>
                <button
                  onClick={handleRequestDischarge}
                  disabled={!dischargeOK || selected.dischargeRequested}
                  className={`px-3 py-1 rounded text-white text-xs ${
                    dischargeOK && !selected.dischargeRequested
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  {selected.dischargeRequested ? 'Discharge requested' : 'Request discharge'}
                </button>
              </div>
            </div>

            {showDeathConfirm && (
              <div className="p-3 rounded bg-red-50 border border-red-200">
                <div className="text-red-800 font-medium mb-2">
                  This will mark {selected.name} as deceased. Are you sure?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkDeath}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    Yes, confirm death
                  </button>
                  <button
                    onClick={() => setShowDeathConfirm(false)}
                    className="px-3 py-1 rounded bg-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}