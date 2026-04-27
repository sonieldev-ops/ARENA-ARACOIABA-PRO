import { ReactNode } from 'react';
import { AdminSidebar } from '@/src/modules/admin/components/AdminSidebar';
import { AdminTopbar } from '@/src/modules/admin/components/AdminTopbar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        <AdminTopbar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        <footer className="p-8 text-center text-slate-600 text-xs font-medium border-t border-slate-900">
          © {new Date().getFullYear()} ARENA PRO • Sistema de Gestão Esportiva Profissional
        </footer>
      </div>
    </div>
  );
}
