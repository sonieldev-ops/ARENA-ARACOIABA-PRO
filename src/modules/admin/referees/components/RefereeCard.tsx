import { Referee, ROLE_LABELS } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, MoreVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RefereeCardProps {
  referee: Referee;
}

export function RefereeCard({ referee }: RefereeCardProps) {
  const roleColors: Record<Referee['role'], string> = {
    MAIN: 'bg-blue-600 text-white border-blue-500',
    ASSISTANT: 'bg-amber-600 text-white border-amber-500',
    FOURTH: 'bg-zinc-700 text-zinc-100 border-zinc-600',
    SCORER: 'bg-emerald-600 text-white border-emerald-500',
  };

  return (
    <Card className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className={`px-2 py-0.5 text-[9px] font-black tracking-widest uppercase border ${roleColors[referee.role]}`}>
            {ROLE_LABELS[referee.role]}
          </Badge>
          <div className="flex items-center gap-1">
             <div className={`w-2 h-2 rounded-full ${referee.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
             <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">
               {referee.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
             </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">
              {referee.fullName}
            </h3>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">
              <MapPin className="w-3 h-3 text-blue-500" />
              {referee.city} - {referee.state}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Jogos</p>
              <p className="text-white font-black text-xl italic">{referee.gamesCount}</p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Último Jogo</p>
              <p className="text-zinc-300 font-bold text-xs">{referee.lastMatchDate || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
              <Phone className="w-3 h-3 text-emerald-500" />
              {referee.phone}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
