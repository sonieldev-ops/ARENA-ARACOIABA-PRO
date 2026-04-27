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

interface RankingEntry {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

const mockRanking: RankingEntry[] = [
  { position: 1, team: 'EC Araçoiaba', points: 12, played: 4, won: 4, drawn: 0, lost: 0, goalsFor: 12, goalsAgainst: 2, goalDifference: 10 },
  { position: 2, team: 'Vila Real FC', points: 9, played: 4, won: 3, drawn: 0, lost: 1, goalsFor: 8, goalsAgainst: 4, goalDifference: 4 },
  { position: 3, team: 'União da Vila', points: 7, played: 4, won: 2, drawn: 1, lost: 1, goalsFor: 5, goalsAgainst: 5, goalDifference: 0 },
];

export default function RankingPage() {
  const columns = [
    { header: '#', accessorKey: 'position' as keyof RankingEntry, className: 'w-10' },
    { header: 'Time', accessorKey: 'team' as keyof RankingEntry, className: 'font-bold text-white' },
    { header: 'P', accessorKey: 'points' as keyof RankingEntry, className: 'font-black text-red-500' },
    { header: 'J', accessorKey: 'played' as keyof RankingEntry },
    { header: 'V', accessorKey: 'won' as keyof RankingEntry },
    { header: 'E', accessorKey: 'drawn' as keyof RankingEntry },
    { header: 'D', accessorKey: 'lost' as keyof RankingEntry },
    { header: 'GP', accessorKey: 'goalsFor' as keyof RankingEntry },
    { header: 'GC', accessorKey: 'goalsAgainst' as keyof RankingEntry },
    { header: 'SG', accessorKey: 'goalDifference' as keyof RankingEntry },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Classificação"
        subtitle="Visualize a tabela de classificação em tempo real."
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
        data={mockRanking}
      />
    </div>
  );
}
