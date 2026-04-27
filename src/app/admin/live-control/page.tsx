'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  startTime?: Timestamp;
}

export default function LiveControlPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState('00:00');

  // Busca partidas que podem ser controladas (LIVE ou SCHEDULED)
  useEffect(() => {
    const q = query(
      collection(db, 'matches'),
      where('status', 'in', ['SCHEDULED', 'LIVE'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
      setMatches(matchesData);

      // Atualiza a partida selecionada se ela mudar no banco
      if (selectedMatch) {
        const updated = matchesData.find(m => m.id === selectedMatch.id);
        if (updated) setSelectedMatch(updated);
      }
    });

    return () => unsubscribe();
  }, [selectedMatch?.id]);

  // Efeito para o cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedMatch?.status === 'LIVE' && selectedMatch.startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = selectedMatch.startTime!.toDate().getTime();
        const diff = Math.floor((now - start) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        setTimer(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      setTimer('00:00');
    }
    return () => clearInterval(interval);
  }, [selectedMatch?.status, selectedMatch?.startTime]);

  const updateMatchStatus = async (status: 'LIVE' | 'FINISHED') => {
    if (!selectedMatch || loading) return;
    setLoading(true);
    try {
      const matchRef = doc(db, 'matches', selectedMatch.id);
      const updateData: any = { status };
      if (status === 'LIVE') updateData.startTime = serverTimestamp();

      await updateDoc(matchRef, updateData);

      await addDoc(collection(db, `matches/${selectedMatch.id}/events`), {
        type: 'STATUS_CHANGE',
        value: status,
        timestamp: serverTimestamp(),
        minute: timer
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerEvent = async (type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUB', team: 'A' | 'B') => {
    if (!selectedMatch || selectedMatch.status !== 'LIVE' || loading) return;
    setLoading(true);
    try {
      const matchRef = doc(db, 'matches', selectedMatch.id);

      // 1. Registra o evento na sub-coleção
      await addDoc(collection(db, `matches/${selectedMatch.id}/events`), {
        type,
        team,
        timestamp: serverTimestamp(),
        minute: timer
      });

      // 2. Se for GOL, atualiza o placar no documento principal
      if (type === 'GOAL') {
        await updateDoc(matchRef, {
          [`score${team}`]: increment(1)
        });
      }

      // Feedback visual/sonoro poderia entrar aqui
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">🏟️ Modo Árbitro - Arena Pro</h1>

      {/* Seleção de Partida */}
      {!selectedMatch ? (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">Selecione uma partida para iniciar:</h2>
          {matches.map(match => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="p-4 bg-white border rounded-xl shadow-sm hover:border-blue-500 transition-all text-left"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">{match.teamA} vs {match.teamB}</span>
                <span className={`text-xs px-2 py-1 rounded ${match.status === 'LIVE' ? 'bg-red-100 text-red-600' : 'bg-slate-100'}`}>
                  {match.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedMatch(null)}
            className="text-blue-600 text-sm mb-4"
          >
            ← Voltar para lista
          </button>

          {/* Placar e Cronômetro */}
          <div className="bg-slate-900 text-white p-8 rounded-2xl text-center shadow-xl">
            <div className="text-sm uppercase tracking-widest text-slate-400 mb-2">Cronômetro</div>
            <div className="text-5xl font-mono font-bold mb-6 text-yellow-400">{timer}</div>

            <div className="flex justify-between items-center px-4">
              <div className="flex-1 text-center">
                <div className="text-xl font-bold mb-2">{selectedMatch.teamA}</div>
                <div className="text-6xl font-black">{selectedMatch.scoreA}</div>
              </div>
              <div className="text-4xl font-light text-slate-500 px-4">VS</div>
              <div className="flex-1 text-center">
                <div className="text-xl font-bold mb-2">{selectedMatch.teamB}</div>
                <div className="text-6xl font-black">{selectedMatch.scoreB}</div>
              </div>
            </div>
          </div>

          {/* Controles de Status */}
          <div className="flex gap-4">
            {selectedMatch.status === 'SCHEDULED' && (
              <button
                onClick={() => updateMatchStatus('LIVE')}
                disabled={loading}
                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                INICIAR PARTIDA
              </button>
            )}
            {selectedMatch.status === 'LIVE' && (
              <button
                onClick={() => updateMatchStatus('FINISHED')}
                disabled={loading}
                className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                ENCERRAR PARTIDA
              </button>
            )}
          </div>

          {/* Controles de Eventos (Apenas se LIVE) */}
          {selectedMatch.status === 'LIVE' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Controles Time A */}
              <div className="space-y-3">
                <h3 className="font-bold text-center border-b pb-2">{selectedMatch.teamA}</h3>
                <button
                  onClick={() => registerEvent('GOAL', 'A')}
                  disabled={loading}
                  className="w-full py-6 bg-blue-600 text-white rounded-xl font-black text-xl shadow-md active:bg-blue-700"
                >
                  GOL ⚽
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => registerEvent('YELLOW_CARD', 'A')} className="py-3 bg-yellow-400 text-yellow-900 rounded-lg font-bold text-sm">AMARELO 🟨</button>
                  <button onClick={() => registerEvent('RED_CARD', 'A')} className="py-3 bg-red-500 text-white rounded-lg font-bold text-sm">VERMELHO 🟥</button>
                </div>
                <button onClick={() => registerEvent('SUB', 'A')} className="w-full py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase">Substituição 🔄</button>
              </div>

              {/* Controles Time B */}
              <div className="space-y-3">
                <h3 className="font-bold text-center border-b pb-2">{selectedMatch.teamB}</h3>
                <button
                  onClick={() => registerEvent('GOAL', 'B')}
                  disabled={loading}
                  className="w-full py-6 bg-blue-600 text-white rounded-xl font-black text-xl shadow-md active:bg-blue-700"
                >
                  GOL ⚽
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => registerEvent('YELLOW_CARD', 'B')} className="py-3 bg-yellow-400 text-yellow-900 rounded-lg font-bold text-sm">AMARELO 🟨</button>
                  <button onClick={() => registerEvent('RED_CARD', 'B')} className="py-3 bg-red-500 text-white rounded-lg font-bold text-sm">VERMELHO 🟥</button>
                </div>
                <button onClick={() => registerEvent('SUB', 'B')} className="w-full py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase">Substituição 🔄</button>
              </div>
            </div>
          )}

          {loading && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px] z-50">
              <div className="bg-white p-4 rounded-full shadow-xl animate-bounce text-2xl">⏳</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
