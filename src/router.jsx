import { Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './components/auth/RequireRole';
import LoginPage from './pages/LoginPage';
import NurseDashboard from './pages/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HeadDoctorDashboard from './pages/HeadDoctorDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import { ROLES } from './utils/permissions';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/nurse"
        element={
          <RequireRole role={ROLES.NURSE}>
            <NurseDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/doctor"
        element={
          <RequireRole role={ROLES.DOCTOR}>
            <DoctorDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role={ROLES.ADMIN}>
            <AdminDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/head-doctor"
        element={
          <RequireRole role={ROLES.HEAD_DOCTOR}>
            <HeadDoctorDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/sys-admin"
        element={
          <RequireRole role={ROLES.SYS_ADMIN}>
            <SystemAdminDashboard />
          </RequireRole>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}