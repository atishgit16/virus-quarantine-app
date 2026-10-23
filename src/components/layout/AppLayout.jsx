import Sidebar from './Sidebar';
import RoleSwitcher from '../auth/RoleSwitcher';

export default function AppLayout({ title, children }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <RoleSwitcher />
        </header>
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}