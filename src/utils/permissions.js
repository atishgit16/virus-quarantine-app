export const ROLES = {
  NURSE: 'nurse',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  HEAD_DOCTOR: 'head_doctor',
  SYS_ADMIN: 'sys_admin',
};

export const ROLE_LABELS = {
  [ROLES.NURSE]: 'Nurse',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.ADMIN]: 'Facility Admin',
  [ROLES.HEAD_DOCTOR]: 'Head Doctor / Quality Lead',
  [ROLES.SYS_ADMIN]: 'System Admin',
};

export const ROLE_HOME = {
  [ROLES.NURSE]: '/nurse',
  [ROLES.DOCTOR]: '/doctor',
  [ROLES.ADMIN]: '/admin',
  [ROLES.HEAD_DOCTOR]: '/head-doctor',
  [ROLES.SYS_ADMIN]: '/sys-admin',
};

export const PERMISSIONS = {
  [ROLES.NURSE]: {
    canRecordTemp: true,
    canViewFeverWarning: true,
    canCorrectTemp: true,
    canPrescribe: false,
    canMarkDoctorVisit: false,
    canRequestDischarge: false,
    canProcessDischarge: false,
    canMarkDeath: false,
  },
  [ROLES.DOCTOR]: {
    canRecordTemp: false,
    canViewReadyForRound: true,
    canMarkDoctorVisit: true,
    canUpdateTreatment: true,
    canRequestDischarge: true,
    canMarkDeath: true,
    canProcessDischarge: false,
  },
  [ROLES.ADMIN]: {
    canAdmitPatient: true,
    canAssignRoom: true,
    canViewOccupancy: true,
    canProcessDischarge: true,
    canEditClinicalData: false,
  },
  [ROLES.HEAD_DOCTOR]: {
    canViewAll: true,
    canOverride: true,
    canViewQualityDashboard: true,
    canViewAuditLog: true,
  },
  [ROLES.SYS_ADMIN]: {
    canManageUsers: true,
    canExportAudit: true,
    canClinicalDecision: false,
  },
};

export function can(role, action) {
  return Boolean(PERMISSIONS[role]?.[action]);
}