import React from "react";

interface TeamData {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function RankingTable({ teams, loading }: { teams: TeamData[], loading: boolean }) {
  if (loading) return <div className="text-gray-400 animate-pulse">Carregando tabela...</div>;
  if (!teams.length) return <div className="text-gray-500 italic">Nenhum dado de classificação disponível.</div>;

  return (
    <div className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 py-3 bg-[#111] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-4 pl-2">Time</div>
        <div className="col-span-1 text-center text-yellow-500">PTS</div>
        <div className="col-span-1 text-center">PJ</div>
        <div className="col-span-1 text-center">V</div>
        <div className="col-span-1 text-center">E</div>
        <div className="col-span-1 text-center">D</div>
        <div className="col-span-1 text-center">SG</div>
        <div className="col-span-1 text-center hidden md:block">GP</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-900">
        {teams.map((team, index) => {
          const isG4 = index < 4;
          const isRelegation = index >= teams.length - 2 && teams.length > 6;

          return (
            <div
              key={team.teamId}
              className={`grid grid-cols-12 px-4 py-4 items-center transition-colors hover:bg-gray-800/50
              ${isG4 ? 'bg-green-500/5' : ''}
              ${isRelegation ? 'bg-red-500/5' : ''}`}
            >
              {/* Posição com barra lateral de zona */}
              <div className="col-span-1 flex items-center justify-center relative">
                <div className={`absolute left-[-16px] w-1 h-8 rounded-r-full
                  ${isG4 ? 'bg-green-500' : isRelegation ? 'bg-red-500' : 'bg-transparent'}`}
                />
                <span className={`text-sm font-bold ${isG4 ? 'text-green-400' : 'text-gray-400'}`}>
                  {team.position}º
                </span>
              </div>

              {/* Time + Logo */}
              <div className="col-span-4 flex items-center gap-3 pl-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden shadow-sm">
                  {team.teamLogo ? (
                    <img src={team.teamLogo} alt={team.teamName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-500 font-black">{team.teamName.substring(0,2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-100 truncate">{team.teamName}</span>
              </div>

              {/* Métricas */}
              <div className="col-span-1 text-center text-sm font-black text-yellow-400">{team.points}</div>
              <div className="col-span-1 text-center text-xs text-gray-400">{team.played}</div>
              <div className="col-span-1 text-center text-xs text-gray-400">{team.wins}</div>
              <div className="col-span-1 text-center text-xs text-gray-400">{team.draws}</div>
              <div className="col-span-1 text-center text-xs text-gray-400">{team.losses}</div>
              <div className="col-span-1 text-center text-xs font-mono font-bold ${team.goalDifference >= 0 ? 'text-green-500' : 'text-red-500'}">
                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
              </div>
              <div className="col-span-1 text-center text-xs text-gray-500 hidden md:block">{team.goalsFor}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
