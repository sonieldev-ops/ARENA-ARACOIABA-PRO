"use client";

import React, { useState, useEffect } from "react";
import { Timer, Zap, Trophy, ShieldAlert } from "lucide-react";

export function LiveMatchCard({ match, events }: { match: any, events: any[] }) {
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (match?.status !== "LIVE" || !match?.startedAt) return;

    const calculateMinute = () => {
      const start = match.startedAt.seconds ? match.startedAt.seconds * 1000 : match.startedAt;
      const diff = Date.now() - start;
      const min = Math.floor(diff / 60000);
      setMinute(min > 90 ? 90 : min);
    };

    calculateMinute();
    const interval = setInterval(calculateMinute, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, [match]);

  if (!match || match.status !== "LIVE") return null;

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-black border border-red-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
      {/* Badge de Live */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-red-500 text-[10px] font-black uppercase tracking-tighter">Ao Vivo</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          <Timer className="w-3 h-3 text-gray-400" />
          <span className="text-white text-xs font-mono font-bold">{minute}'</span>
        </div>
      </div>

      {/* Placar Principal */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-3 border border-gray-700 shadow-inner">
             <span className="text-2xl font-black text-white">{match.teamAName.substring(0,2).toUpperCase()}</span>
          </div>
          <span className="text-xs font-bold text-gray-400 text-center uppercase truncate w-24">{match.teamAName}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{match.scoreA}</span>
          <span className="text-gray-700 font-black text-2xl">:</span>
          <span className="text-6xl font-black text-white tabular-nums tracking-tighter">{match.scoreB}</span>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-3 border border-gray-700 shadow-inner">
             <span className="text-2xl font-black text-white">{match.teamBName.substring(0,2).toUpperCase()}</span>
          </div>
          <span className="text-xs font-bold text-gray-400 text-center uppercase truncate w-24">{match.teamBName}</span>
        </div>
      </div>

      {/* Timeline de Eventos */}
      <div className="border-t border-gray-800/50 pt-4">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3" /> Eventos Recentes
        </h4>

        <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
          {events.length === 0 ? (
            <p className="text-[10px] text-gray-600 italic">Nenhum evento registrado até o momento.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-300">
                <span className="text-[10px] font-mono font-bold text-gray-500 w-6">{event.minute}'</span>
                <div className="flex-1 bg-gray-900/50 rounded-lg p-2 flex items-center gap-2 border border-gray-800/50">
                  {event.type === 'GOAL' && <Trophy className="w-3 h-3 text-yellow-500" />}
                  {event.type === 'YELLOW_CARD' && <div className="w-2 h-3 bg-yellow-400 rounded-sm" />}
                  {event.type === 'RED_CARD' && <div className="w-2 h-3 bg-red-500 rounded-sm" />}
                  <span className="text-[11px] text-gray-200">
                    <b className="text-white uppercase">{event.type}</b> - {event.playerName}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
