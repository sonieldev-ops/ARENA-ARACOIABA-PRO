'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

export default function LiveMatchControl() {
  const { id } = useParams();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui usaremos o Client SDK para ouvir em tempo real
    // mas para o controle, as ações vão via API (Server SDK)
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/admin/matches/${id}`);
        const data = await res.json();
        setMatch(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleAction = async (action: string, extraData: any = {}) => {
    try {
      const res = await fetch('/api/admin/matches/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, matchId: id, ...extraData })
      });

      if (res.ok) {
        toast.success(`Ação ${action} realizada!`);
        // Opcional: Re-fetch ou confiar no listener de tempo real
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro na ação');
      }
    } catch (err) {
      toast.error('Erro de conexão');
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!match) return <div>Partida não encontrada</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle ao Vivo: {match.teamAName} vs {match.teamBName}</h1>
        <div className="text-xl font-mono bg-black p-2 rounded border border-yellow-500/50">
          {match.scoreA} - {match.scoreB}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>{match.teamAName}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('GOAL', { teamId: match.teamAId, minute: 15, athleteId: 'dummy' })}
            >
              Marcar Gol
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader><CardTitle>{match.teamBName}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('GOAL', { teamId: match.teamBId, minute: 15, athleteId: 'dummy' })}
            >
              Marcar Gol
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        {match.status === 'SCHEDULED' && (
          <Button onClick={() => handleAction('START')} variant="outline">Iniciar Partida</Button>
        )}
        {match.status === 'LIVE' && (
          <Button onClick={() => handleAction('FINISH')} variant="destructive">Finalizar Partida</Button>
        )}
      </div>
    </div>
  );
}
