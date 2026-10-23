import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { todayISO } from '../utils/dateHelpers';

const DataContext = createContext(null);

const SEED_PATIENTS = [
  { id: 'p1', name: 'Alice Martin', room: '101-A', admittedAt: '2024-06-01', status: 'active', dischargeRequested: false, treatment: 'Antiviral A', death: false },
  { id: 'p2', name: 'Ben Osei', room: '101-B', admittedAt: '2024-06-02', status: 'active', dischargeRequested: false, treatment: 'Observation', death: false },
  { id: 'p3', name: 'Cara Díaz', room: '102-A', admittedAt: '2024-06-03', status: 'active', dischargeRequested: false, treatment: 'Antiviral B', death: false },
];

const SEED_TEMPS = [
  // Alice: 4-day streak
  { id: 't1', patientId: 'p1', date: '2024-06-10', valueC: 37.1, timestamp: '2024-06-10T09:00:00.000Z' },
  { id: 't2', patientId: 'p1', date: '2024-06-11', valueC: 36.9, timestamp: '2024-06-11T09:00:00.000Z' },
  { id: 't3', patientId: 'p1', date: '2024-06-12', valueC: 37.0, timestamp: '2024-06-12T09:00:00.000Z' },
  { id: 't4', patientId: 'p1', date: '2024-06-13', valueC: 37.2, timestamp: '2024-06-13T09:00:00.000Z' },
  // Ben: today fever
  { id: 't5', patientId: 'p2', date: '2024-06-13', valueC: 38.6, timestamp: '2024-06-13T08:00:00.000Z' },
  // Cara: no readings yet
];

const SEED_AUDIT = [
  { id: 'a1', at: new Date().toISOString(), actor: 'system', action: 'SEED_DATA', detail: 'Prototype seeded' },
];

export function DataProvider({ children }) {
  const [patients, setPatients] = useLocalStorage('vq.patients', SEED_PATIENTS);
  const [temperatures, setTemperatures] = useLocalStorage('vq.temperatures', SEED_TEMPS);
  const [audit, setAudit] = useLocalStorage('vq.audit', SEED_AUDIT);

  const logAudit = useCallback(
    (actor, action, detail) => {
      setAudit((prev) => [
        { id: `a${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), actor, action, detail },
        ...prev,
      ]);
    },
    [setAudit]
  );

  const getTempsForPatient = useCallback(
    (patientId) => temperatures.filter((t) => t.patientId === patientId),
    [temperatures]
  );

  const getTodayTemp = useCallback(
    (patientId) => {
      const today = todayISO();
      return temperatures.find((t) => t.patientId === patientId && t.date === today) || null;
    },
    [temperatures]
  );

  const recordTemperature = useCallback(
    ({ patientId, valueC, actor, correctionReason = null }) => {
      const today = todayISO();
      const existing = temperatures.find((t) => t.patientId === patientId && t.date === today);
      if (existing && !correctionReason) {
        return { ok: false, error: 'A temperature is already recorded for today.' };
      }
      const entry = {
        id: `t${Date.now()}`,
        patientId,
        date: today,
        valueC: Number(valueC),
        timestamp: new Date().toISOString(),
        correctionReason,
      };
      setTemperatures((prev) => [entry, ...prev]);
      logAudit(actor, correctionReason ? 'TEMP_CORRECTED' : 'TEMP_RECORDED', `Patient ${patientId}: ${valueC}°C`);
      return { ok: true, entry };
    },
    [temperatures, setTemperatures, logAudit]
  );

  const markDoctorVisit = useCallback(
    ({ patientId, actor }) => {
      logAudit(actor, 'DOCTOR_VISIT', `Patient ${patientId} visited`);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, lastVisitAt: new Date().toISOString() } : p))
      );
      return { ok: true };
    },
    [setPatients, logAudit]
  );

  const updateTreatment = useCallback(
    ({ patientId, treatment, actor }) => {
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, treatment } : p)));
      logAudit(actor, 'TREATMENT_UPDATED', `Patient ${patientId}: ${treatment}`);
    },
    [setPatients, logAudit]
  );

  const requestDischarge = useCallback(
    ({ patientId, actor }) => {
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, dischargeRequested: true } : p)));
      logAudit(actor, 'DISCHARGE_REQUESTED', `Patient ${patientId}`);
    },
    [setPatients, logAudit]
  );

  const processDischarge = useCallback(
    ({ patientId, actor }) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'discharged', dischargeRequested: false } : p))
      );
      logAudit(actor, 'DISCHARGED', `Patient ${patientId}`);
    },
    [setPatients, logAudit]
  );

  const markDeath = useCallback(
    ({ patientId, actor }) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'deceased', death: true } : p))
      );
      logAudit(actor, 'DEATH', `Patient ${patientId}`);
    },
    [setPatients, logAudit]
  );

  const admitPatient = useCallback(
    ({ name, room, actor }) => {
      const activeCount = patients.filter((p) => p.status === 'active').length;
      if (activeCount >= 74) {
        return { ok: false, error: 'Facility at capacity (74/74).' };
      }
      const patient = {
        id: `p${Date.now()}`,
        name,
        room,
        admittedAt: todayISO(),
        status: 'active',
        dischargeRequested: false,
        treatment: 'Observation',
        death: false,
      };
      setPatients((prev) => [patient, ...prev]);
      logAudit(actor, 'ADMITTED', `${name} → ${room}`);
      return { ok: true, patient };
    },
    [patients, setPatients, logAudit]
  );

  const overrideRecord = useCallback(
    ({ actor, action, reason }) => {
      logAudit(actor, `OVERRIDE:${action}`, reason);
    },
    [logAudit]
  );

  const resetDemo = useCallback(() => {
    setPatients(SEED_PATIENTS);
    setTemperatures(SEED_TEMPS);
    setAudit(SEED_AUDIT);
  }, [setPatients, setTemperatures, setAudit]);

  const value = useMemo(
    () => ({
      patients,
      temperatures,
      audit,
      getTempsForPatient,
      getTodayTemp,
      recordTemperature,
      markDoctorVisit,
      updateTreatment,
      requestDischarge,
      processDischarge,
      markDeath,
      admitPatient,
      overrideRecord,
      resetDemo,
    }),
    [
      patients,
      temperatures,
      audit,
      getTempsForPatient,
      getTodayTemp,
      recordTemperature,
      markDoctorVisit,
      updateTreatment,
      requestDischarge,
      processDischarge,
      markDeath,
      admitPatient,
      overrideRecord,
      resetDemo,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}