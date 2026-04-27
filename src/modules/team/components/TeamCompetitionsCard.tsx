import { Competition } from "../types/team.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TeamCompetitionsCardProps {
  competitions: Competition[];
  onRegister: (id: string) => Promise<void>;
}

export function TeamCompetitionsCard({ competitions, onRegister }: TeamCompetitionsCardProps) {
  return (
    <Card className="shadow-sm border-slate-200 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Campeonatos Abertos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum campeonato com inscrições abertas no momento.</p>
            </div>
          ) : (
            competitions.map((comp) => (
              <div key={comp.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{comp.name}</h3>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">
                    INSCRIÇÕES ABERTAS
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Início: {comp.startDate?.toDate?.()?.toLocaleDateString('pt-BR') || 'A definir'}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-slate-900 hover:bg-blue-600 font-bold transition-all"
                  onClick={() => onRegister(comp.id)}
                >
                  INSCREVER TIME <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
