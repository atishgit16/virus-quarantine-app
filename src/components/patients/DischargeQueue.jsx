import { formatDate } from '../../utils/dateHelpers';

export default function DischargeQueue({ patients, onProcess }) {
  const queue = patients.filter((p) => p.status === 'active' && p.dischargeRequested);
  if (queue.length === 0) {
    return <div className="text-slate-500 text-sm">No pending discharges.</div>;
  }
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">Patient</th>
            <th className="text-left px-4 py-2">Room</th>
            <th className="text-left px-4 py-2">Admitted</th>
            <th className="text-right px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-2 font-medium">{p.name}</td>
              <td className="px-4 py-2">{p.room}</td>
              <td className="px-4 py-2">{formatDate(p.admittedAt)}</td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => onProcess(p)}
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  Process Discharge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}