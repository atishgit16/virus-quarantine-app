export default function FeverStreakBadge({ streak }) {
  const tone =
    streak >= 3
      ? 'bg-green-100 text-green-800'
      : streak > 0
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tone}`}>
      {streak} day{streak === 1 ? '' : 's'} fever-free
    </span>
  );
}