"use client";

import React from "react";
import { TopScorer } from "../hooks/useTopScorers";

interface TopScorersTableProps {
  players: TopScorer[];
  loading?: boolean;
}

export function TopScorersTable({ players, loading }: TopScorersTableProps) {
  if (loading) {
    return (
      <div className="bg-[#0f1115] text-white rounded-2xl overflow-hidden border border-white/5 animate-pulse">
        <div className="px-5 py-4 border-b border-white/5 bg-white/5">
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between px-5 py-4 border-b border-white/5">
            <div className="flex gap-3 items-center">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="w-32 h-4 bg-white/10 rounded" />
            </div>
            <div className="w-6 h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#0f1115] text-white rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">
          Artilharia do Campeonato
        </h3>
        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-bold">
          LIVE
        </span>
      </div>

      <div className="flex flex-col">
        {players.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            Nenhum gol registrado ainda.
          </div>
        ) : (
          players.map((player, index) => (
            <div
              key={player.playerId}
              className={`flex justify-between items-center px-5 py-4 border-b border-white/5 transition-colors hover:bg-white/[0.02]
              ${index === 0 ? "bg-yellow-500/5" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 text-right font-mono text-sm ${
                  index === 0 ? "text-yellow-500 font-bold" : "text-gray-500"
                }`}>
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${index === 0 ? "text-yellow-100" : "text-gray-200"}`}>
                    {player.playerName}
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-tight">
                    {player.teamName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {index === 0 && (
                  <span className="text-lg">👑</span>
                )}
                <span className={`text-lg font-black ${index === 0 ? "text-yellow-500" : "text-white"}`}>
                  {player.goals}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-3 bg-white/[0.01] text-center">
        <button className="text-[11px] text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
          Ver lista completa
        </button>
      </div>
    </div>
  );
}
