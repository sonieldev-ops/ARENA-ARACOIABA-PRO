"use client";

import React from "react";
import { useRanking } from "@/src/modules/ranking/hooks/useRanking";
import { RankingTable } from "@/src/modules/ranking/components/RankingTable";
import { Trophy, Info } from "lucide-react";

export default function AthleteRankingPage() {
  // Nota: championship_1 é um ID de exemplo.
  // Em produção, isso viria do contexto do usuário ou parâmetro da URL.
  const { teams, loading } = useRanking("championship_1");

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Header da Página */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest">Temporada 2024</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">CLASSIFICAÇÃO GERAL</h1>
          <p className="text-gray-500 text-sm mt-1">Atualizado em tempo real com base nos resultados oficiais.</p>
        </div>

        <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
           <div className="flex flex-col items-center px-4 border-r border-gray-800">
             <span className="text-[10px] text-gray-500 uppercase font-bold">Times</span>
             <span className="text-lg font-black text-white">{teams.length}</span>
           </div>
           <div className="flex flex-col items-center px-4">
             <span className="text-[10px] text-gray-500 uppercase font-bold">Fase</span>
             <span className="text-lg font-black text-blue-500">GRUPOS</span>
           </div>
        </div>
      </div>

      {/* Tabela de Ranking */}
      <div className="max-w-5xl mx-auto">
        <RankingTable teams={teams} loading={loading} />

        {/* Legenda */}
        <div className="mt-6 flex flex-wrap gap-6 items-center bg-[#0a0a0a] p-4 rounded-xl border border-gray-900">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
            <span>Zona de Classificação (G4)</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
            <span>Zona de Rebaixamento</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto">
            <Info className="w-3 h-3" />
            <span>Critério: Pontos > Saldo > Gols Pró</span>
          </div>
        </div>
      </div>
    </div>
  );
}
