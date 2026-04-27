'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from '@/src/modules/admin/components/AdminSidebar';
import { AdminTopbar } from '@/src/modules/admin/components/AdminTopbar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col md:pl-64">
        <AdminTopbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
