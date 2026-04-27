'use client';

import { useState } from 'react';
import { Referee, ROLE_LABELS } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, User, Users, ClipboardList, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RefereeAssignmentProps {
  referees: Referee[];
  onAssign: (assignment: any) => void;
}

export function RefereeAssignment({ referees, onAssign }: RefereeAssignmentProps) {
  const [assignment, setAssignment] = useState({
    main: '',
    assistant1: '',
    assistant2: '',
    fourth: '',
    scorer: ''
  });

  const getFilteredReferees = (role: string) => {
    // If we wanted to filter by role properly:
    // return referees.filter(r => r.role === role);
    // But for flexibility, let's show all or just filter by some logic
    return referees.filter(r => r.status === 'ACTIVE');
  };

  const positions = [
    { id: 'main', label: 'Juiz Principal', icon: ShieldCheck, role: 'MAIN' },
    { id: 'assistant1', label: 'Bandeirinha 1', icon: User, role: 'ASSISTANT' },
    { id: 'assistant2', label: 'Bandeirinha 2', icon: User, role: 'ASSISTANT' },
    { id: 'fourth', label: 'Quarto Árbitro', icon: Users, role: 'FOURTH' },
    { id: 'scorer', label: 'Mesário', icon: ClipboardList, role: 'SCORER' },
  ];

  return (
    <Card className="bg-zinc-900/40 border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-zinc-800/50 p-6">
        <CardTitle className="text-white font-bold uppercase italic tracking-wider flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Timer className="h-5 w-5 text-blue-500" />
          </div>
          Escalação de Arbitragem
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {positions.map((pos) => (
            <div key={pos.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3 sm:w-48">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <pos.icon className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{pos.label}</p>
                </div>
              </div>

              <div className="flex-1">
                <Select
                  value={assignment[pos.id as keyof typeof assignment]}
                  onValueChange={(v) => setAssignment({...assignment, [pos.id]: v})}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-11">
                    <SelectValue placeholder="Selecionar árbitro..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {getFilteredReferees(pos.role).map(ref => (
                      <SelectItem key={ref.id} value={ref.id}>
                        {ref.fullName} ({ref.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => onAssign(assignment)}
          className="w-full bg-zinc-100 hover:bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl transition-all shadow-xl active:scale-[0.98]"
        >
          Confirmar Escalação
        </Button>
      </CardContent>
    </Card>
  );
}
