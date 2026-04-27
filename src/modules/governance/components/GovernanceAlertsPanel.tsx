import React from 'react';
import { GovernanceAlert } from '../types/governance.types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GovernanceAlertsPanelProps {
  alerts: GovernanceAlert[];
}

export function GovernanceAlertsPanel({ alerts }: GovernanceAlertsPanelProps) {
  if (alerts.length === 0) return null;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return 'destructive';
    return 'default';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        Alertas de Governança
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={getVariant(alert.severity)} className="bg-white border-slate-200 shadow-sm overflow-hidden">
            {getIcon(alert.severity)}
            <AlertTitle className="font-bold">{alert.title}</AlertTitle>
            <AlertDescription className="text-xs mt-1 text-slate-600">
              {alert.message}
              {alert.actionLabel && alert.actionUrl && (
                <div className="mt-2">
                  <Link href={alert.actionUrl}>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                      {alert.actionLabel}
                    </Button>
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  );
}
