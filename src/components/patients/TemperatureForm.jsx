import { useState } from 'react';
import Modal from '../ui/Modal';

export default function TemperatureForm({ open, patient, onClose, onSubmit, isCorrection }) {
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!patient) return null;

  const submit = () => {
    const num = Number(value);
    if (!value || Number.isNaN(num) || num < 30 || num > 45) {
      setError('Enter a valid temperature between 30°C and 45°C.');
      return;
    }
    if (isCorrection && reason.trim().length < 3) {
      setError('A correction reason is required.');
      return;
    }
    onSubmit({ valueC: num, correctionReason: isCorrection ? reason.trim() : null });
    setValue('');
    setReason('');
    setError('');
  };

  return (
    <Modal
      open={open}
      title={`${isCorrection ? 'Correct' : 'Record'} temperature — ${patient.name}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-sm">
            Cancel
          </button>
          <button onClick={submit} className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm">
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 37.4"
          />
        </div>
        {isCorrection && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correction reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Why are you correcting today's entry?"
            />
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
    </Modal>
  );
}