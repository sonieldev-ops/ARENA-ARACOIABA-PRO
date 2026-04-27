import { AuditEvent } from "../types/admin-dashboard.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, User, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatFirebaseDate, translateAction } from "@/src/lib/utils";

export function AdminRecentActivity({ events }: { events: AuditEvent[] }) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Atividade Recente do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6 italic">Nenhuma atividade registrada.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex gap-4 p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                <div className="mt-1">{getSeverityIcon(event.severity)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{translateAction(event.action)}</p>
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatFirebaseDate(event.timestamp) || 'Recente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="h-3 w-3" />
                    <span>{event.operatorName}</span>
                    {event.targetName && (
                      <>
                        <span className="text-slate-300">→</span>
                        <span className="font-medium text-blue-600">{event.targetName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
