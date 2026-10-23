import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import DischargeQueue from '../components/patients/DischargeQueue';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const CAPACITY = 74;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { patients, admitPatient, processDischarge } = useData();

  const [showAdmit, setShowAdmit] = useState(false);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');

  const active = patients.filter((p) => p.status === 'active');
  const occupancy = active.length;
  const atCapacity = occupancy >= CAPACITY;
  const discharged = patients.filter((p) => p.status === 'discharged').length;
  const deceased = patients.filter((p) => p.status === 'deceased').length;

  const submitAdmit = () => {
    if (!name.trim()) {
      setError('Patient name is required.');
      return;
    }
    const res = admitPatient({ name: name.trim(), room: room.trim() || 'TBD', actor: user?.role });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setName('');
    setRoom('');
    setError('');
    setShowAdmit(false);
  };

  const handleProcess = (patient) => {
    if (!window.confirm(`Process discharge for ${patient.name}?`)) return;
    processDischarge({ patientId: patient.id, actor: user?.role });
  };

  return (
    <AppLayout title="Facility Admin">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Occupancy" value={`${occupancy} / ${CAPACITY}`} tone={atCapacity ? 'red' : 'green'} />
        <StatCard label="Active patients" value={active.length} />
        <StatCard label="Discharged (total)" value={discharged} />
        <StatCard label="Deceased (total)" value={deceased} tone={deceased > 0 ? 'red' : 'default'} />
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-700">Discharge queue</h2>
        <button
          onClick={() => setShowAdmit(true)}
          disabled={atCapacity}
          className={`px-3 py-1.5 rounded text-white text-sm ${
            atCapacity ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={atCapacity ? 'Facility at capacity' : 'Admit a new patient'}
        >
          {atCapacity ? 'Capacity reached' : 'Admit patient'}
        </button>
      </div>
      <DischargeQueue patients={patients} onProcess={handleProcess} />

      <Modal
        open={showAdmit}
        title="Admit new patient"
        onClose={() => setShowAdmit(false)}
        footer={
          <>
            <button onClick={() => setShowAdmit(false)} className="px-3 py-1.5 rounded bg-slate-200 text-sm">
              Cancel
            </button>
            <button onClick={submitAdmit} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">
              Admit
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Patient name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Room / bed</label>
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 103-B"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </Modal>
    </AppLayout>
  );
}

function StatCard({ label, value, tone = 'default' }) {
  const toneMap = {
    default: 'text-slate-900',
    green: 'text-green-700',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold ${toneMap[tone]}`}>{value}</div>
    </div>
  );
}