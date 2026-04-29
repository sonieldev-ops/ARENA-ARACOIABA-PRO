'use client';

import { Save, Globe, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminActionButton } from '@/src/modules/admin/components/AdminActionButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <AdminPageHeader
        title="Configurações"
        subtitle="Configurações globais da plataforma e preferências do sistema."
        action={
          <AdminActionButton icon={Save}>
            Salvar Alterações
          </AdminActionButton>
        }
      />

      <div className="space-y-6">
        <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-red-600" />
            Geral
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-400 font-bold">NOME DA PLATAFORMA</Label>
              <Input defaultValue="ARENA PRO" className="bg-slate-900 border-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 font-bold">CIDADE SEDE</Label>
              <Input defaultValue="Arena Pro" className="bg-slate-900 border-slate-800 rounded-xl" />
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-600" />
            Temporada Atual
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-400 font-bold">ANO DE REFERÊNCIA</Label>
              <Input defaultValue="2024" type="number" className="bg-slate-900 border-slate-800 rounded-xl" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <p className="font-bold text-white">Inscrições Abertas</p>
                <p className="text-xs text-slate-500">Permitir que novos times se inscrevam</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            Segurança & Acesso
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <p className="font-bold text-white">Aprovação Manual</p>
                <p className="text-xs text-slate-500">Exigir aprovação para novos usuários Staff</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <p className="font-bold text-white">Modo Manutenção</p>
                <p className="text-xs text-slate-500">Bloquear acesso público temporariamente</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
