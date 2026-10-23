import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PatientTable from '../components/patients/PatientTable';
import TemperatureForm from '../components/patients/TemperatureForm';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { todayISO } from '../utils/dateHelpers';

export default function NurseDashboard() {
  const { user } = useAuth();
  const {
    patients,
    getTempsForPatient,
    getTodayTemp,
    recordTemperature,
  } = useData();

  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('record'); // 'record' | 'correct'

  const activePatients = patients.filter((p) => p.status === 'active');
  const recordedToday = activePatients.filter((p) => getTodayTemp(p.id)).length;

  const handleSubmit = ({ valueC, correctionReason }) => {
    if (!selected) return;
    const res = recordTemperature({
      patientId: selected.id,
      valueC,
      actor: user?.role ?? 'nurse',
      correctionReason,
    });
    if (!res.ok) {
      alert(res.error);
      return;
    }
    setSelected(null);
  };

  return (
    <AppLayout title="Nurse Dashboard">
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-slate-500">Active patients</div>
          <div className="text-2xl font-bold text-slate-900">{activePatients.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-slate-500">Temp recorded today</div>
          <div className="text-2xl font-bold text-slate-900">
            {recordedToday} / {activePatients.length}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-700 mb-2">
        Daily temperature queue — {todayISO()}
      </h2>
      <PatientTable
        patients={activePatients}
        getTempsForPatient={getTempsForPatient}
        getTodayTemp={getTodayTemp}
        renderActions={(p, { todayTemp }) => (
          <div className="flex gap-2 justify-end">
            {!todayTemp ? (
              <button
                onClick={() => {
                  setMode('record');
                  setSelected(p);
                }}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Record Temp
              </button>
            ) : (
              <button
                onClick={() => {
                  setMode('correct');
                  setSelected(p);
                }}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs"
              >
                Correct
              </button>
            )}
            <span className="text-xs text-slate-400 self-center">
              {todayTemp ? 'Recorded' : 'Pending'}
            </span>
          </div>
        )}
      />

      <TemperatureForm
        open={!!selected}
        patient={selected}
        isCorrection={mode === 'correct'}
        onClose={() => setSelected(null)}
        onSubmit={handleSubmit}
      />
    </AppLayout>
  );
}