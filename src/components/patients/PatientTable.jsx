import FeverStreakBadge from './FeverStreakBadge';
import { calculateFeverFreeStreak } from '../../hooks/useFeverStreak';
import { formatDate, isFever, todayISO } from '../../utils/dateHelpers';

export default function PatientTable({
  patients,
  getTempsForPatient,
  getTodayTemp,
  renderActions,
}) {
  const today = todayISO();

  if (patients.length === 0) {
    return <div className="text-slate-500 text-sm">No patients.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">Patient</th>
            <th className="text-left px-4 py-2">Room</th>
            <th className="text-left px-4 py-2">Admitted</th>
            <th className="text-left px-4 py-2">Today's Temp</th>
            <th className="text-left px-4 py-2">Fever Streak</th>
            <th className="text-right px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const temps = getTempsForPatient(p.id);
            const todayTemp = getTodayTemp(p.id);
            const streak = calculateFeverFreeStreak(temps, today);
            return (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-2">{p.room}</td>
                <td className="px-4 py-2">{formatDate(p.admittedAt)}</td>
                <td className="px-4 py-2">
                  {todayTemp ? (
                    <span className={isFever(todayTemp.valueC) ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                      {todayTemp.valueC}°C {isFever(todayTemp.valueC) && '⚠ Fever'}
                    </span>
                  ) : (
                    <span className="text-slate-400">Not recorded</span>
                  )}
                </td>
                <td className="px-4 py-2"><FeverStreakBadge streak={streak} /></td>
                <td className="px-4 py-2 text-right">{renderActions(p, { todayTemp, streak })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}