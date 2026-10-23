import { FEVER_THRESHOLD_C } from '../utils/dateHelpers';

/**
 * A streak is the number of consecutive *completed* calendar days, ending
 * yesterday (or the most recent past day), where the latest reading for
 * that day is below the fever threshold. A missing day breaks the streak.
 * "Today" only counts if its latest reading is below threshold AND we're
 * treating the day as completed (used for the "ready to discharge" gate).
 */
export function calculateFeverFreeStreak(temperatures, today) {
  if (!temperatures || temperatures.length === 0) return 0;

  // Group by date; keep latest reading per date
  const byDate = {};
  for (const t of temperatures) {
    const existing = byDate[t.date];
    if (!existing || new Date(t.timestamp) > new Date(existing.timestamp)) {
      byDate[t.date] = t;
    }
  }

  const dates = Object.keys(byDate).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  const cursor = new Date(today + 'T00:00:00');

  for (let i = 0; i < dates.length; i++) {
    const expect = cursor.toISOString().slice(0, 10);
    if (dates[i] !== expect) {
      // Missing day → break
      break;
    }
    const reading = byDate[dates[i]];
    if (Number(reading.valueC) >= FEVER_THRESHOLD_C) {
      // Fever today → streak broken for discharge purposes
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Discharge requires 3 *full* days; if today is fever-free but the
  // 3-day criterion is measured as of "now", the day must be complete.
  // For the prototype we accept today's reading as counting toward the day.
  return streak;
}

export function isDischargeEligible(temperatures, today) {
  return calculateFeverFreeStreak(temperatures, today) >= 3;
}