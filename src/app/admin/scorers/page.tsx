'use client';

import { AdminPageHeader } from '@/src/modules/admin/components/AdminPageHeader';
import { AdminDataTable } from '@/src/modules/admin/components/AdminDataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScorerEntry {
  position: number;
  athlete: string;
  team: string;
  goals: number;
}

const mockScorers: ScorerEntry[] = [
  { position: 1, athlete: 'Ricardo Oliveira', team: 'EC Araçoiaba', goals: 12 },
  { position: 2, athlete: 'Marcos Silva', team: 'Vila Real FC', goals: 8 },
  { position: 3, athlete: 'Juninho Pernambucano', team: 'Palmeirinha', goals: 7 },
  { position: 4, athlete: 'Gabriel Barbosa', team: 'EC Araçoiaba', goals: 6 },
  { position: 5, athlete: 'Dudu', team: 'Juventus', goals: 5 },
];

export default function ScorersPage() {
  const columns = [
    { header: '#', accessorKey: 'position' as keyof ScorerEntry, className: 'w-10' },
    { header: 'Atleta', accessorKey: 'athlete' as keyof ScorerEntry, className: 'font-bold text-white' },
    { header: 'Time', accessorKey: 'team' as keyof ScorerEntry },
    { header: 'Gols', accessorKey: 'goals' as keyof ScorerEntry, className: 'font-black text-red-500 text-lg' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Artilharia"
        subtitle="Ranking de goleadores da temporada."
        action={
          <Select defaultValue="ouro">
            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-800 text-white rounded-xl">
              <SelectValue placeholder="Selecione o campeonato" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-white">
              <SelectItem value="ouro">Série Ouro 2024</SelectItem>
              <SelectItem value="prata">Série Prata 2024</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <AdminDataTable
        columns={columns}
        data={mockScorers}
      />
    </div>
  );
}
