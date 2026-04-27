'use client';

import { useState } from 'react';
import { useLiveControl } from '@/hooks/useLiveControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users, AlertTriangle, Play, Square, Loader2 } from 'lucide-react';

export default function LiveControlPage() {
  const {
    matches,
    selectedMatch,
    setSelectedMatch,
    loading,
    actionLoading,
    startMatch,
    finishMatch,
    registerGoal,
    registerCard,
    registerSubstitution
  } = useLiveControl();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modo Árbitro</h1>
          <p className="text-sm text-slate-500">Controle de partidas em tempo real</p>
        </div>
        <div className="w-64">
          <Select
            onValueChange={(id) => setSelectedMatch(matches.find(m => m.id === id) || null)}
            value={selectedMatch?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar Partida" />
            </SelectTrigger>
            <SelectContent>
              {matches.map(match => (
                <SelectItem key={match.id} value={match.id}>
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {!selectedMatch ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Trophy className="mx-auto w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Selecione uma partida para começar o controle</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dashboard de Placar */}
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-center text-center">
                <div className="flex-1 space-y-2">
                  <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center text-2xl font-bold">
                    {selectedMatch.homeTeam.name[0]}
                  </div>
                  <h3 className="font-bold text-lg">{selectedMatch.homeTeam.name}</h3>
                </div>

                <div className="flex-1">
                  <div className="text-6xl font-black tabular-nums tracking-tighter">
                    {selectedMatch.homeTeam.score} - {selectedMatch.awayTeam.score}
                  </div>
                  <Badge variant={selectedMatch.status === 'LIVE' ? 'destructive' : 'secondary'} className="mt-2 uppercase tracking-widest px-4 py-1">
                    {selectedMatch.status === 'LIVE' ? 'AO VIVO' : 'AGUARDANDO'}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center text-2xl font-bold">
                    {selectedMatch.awayTeam.name[0]}
                  </div>
                  <h3 className="font-bold text-lg">{selectedMatch.awayTeam.name}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controles de Partida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Play className="w-4 h-4" /> Status da Partida
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                {selectedMatch.status === 'SCHEDULED' && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={startMatch}
                    disabled={actionLoading}
                  >
                    Iniciar Partida
                  </Button>
                )}
                {selectedMatch.status === 'LIVE' && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={finishMatch}
                    disabled={actionLoading}
                  >
                    Encerrar Partida
                  </Button>
                )}
                {selectedMatch.status === 'FINISHED' && (
                  <Button disabled className="w-full">Partida Finalizada</Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  {selectedMatch.status !== 'LIVE'
                    ? 'As ações estarão disponíveis quando a partida estiver LIVE.'
                    : 'Use os botões abaixo ou selecione um jogador.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ações de Campo */}
          {selectedMatch.status === 'LIVE' && (
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="home">{selectedMatch.homeTeam.name}</TabsTrigger>
                <TabsTrigger value="away">{selectedMatch.awayTeam.name}</TabsTrigger>
              </TabsList>

              <MatchActionPanel
                team={selectedMatch.homeTeam}
                isHome={true}
                onGoal={registerGoal}
                onCard={registerCard}
                onSub={registerSubstitution}
                loading={actionLoading}
              />
              <MatchActionPanel
                team={selectedMatch.awayTeam}
                isHome={false}
                onGoal={registerGoal}
                onCard={registerCard}
                onSub={registerSubstitution}
                loading={actionLoading}
              />
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}

function MatchActionPanel({ team, isHome, onGoal, onCard, onSub, loading }: any) {
  // Mock players - No cenário real, viria do banco vinculado ao time
  const players = [
    { id: 'p1', name: 'Jogador 10', number: '10' },
    { id: 'p2', name: 'Jogador 07', number: '7' },
    { id: 'p3', name: 'Jogador 01', number: '1' },
    { id: 'p4', name: 'Jogador 05', number: '5' },
  ];

  return (
    <TabsContent value={isHome ? 'home' : 'away'} className="space-y-4 pt-4">
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-200 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                      {player.number}
                    </div>
                    <span className="font-medium">{player.name}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      onClick={() => onGoal(team.id, player, isHome)}
                      disabled={loading}
                    >
                      GOL
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-200"
                      onClick={() => onCard(team.id, player, 'YELLOW_CARD')}
                      disabled={loading}
                    >
                      🟨
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                      onClick={() => onCard(team.id, player, 'RED_CARD')}
                      disabled={loading}
                    >
                      🟥
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
