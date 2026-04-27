import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BulkOperationResult } from '../types/user-bulk.types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BulkOperationResultDialogProps {
  result: BulkOperationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BulkOperationResultDialog({
  result,
  isOpen,
  onClose
}: BulkOperationResultDialogProps) {
  if (!result) return null;

  const hasFailures = result.totalFailed > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasFailures ? (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            Resultado da Operação: {result.action}
          </DialogTitle>
          <DialogDescription>
            ID da Operação (Audit): <code className="bg-slate-100 px-1 rounded">{result.correlationId}</code>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="bg-slate-50 p-4 rounded-lg text-center border">
            <div className="text-2xl font-bold">{result.totalRequested}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Solicitados</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-600">{result.totalSucceeded}</div>
            <div className="text-xs text-emerald-600 uppercase tracking-wider">Sucesso</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
            <div className="text-2xl font-bold text-red-600">{result.totalFailed}</div>
            <div className="text-xs text-red-600 uppercase tracking-wider">Falha</div>
          </div>
        </div>

        <div className="flex-1 min-h-0 space-y-2">
          <h4 className="text-sm font-semibold">Detalhes por usuário:</h4>
          <ScrollArea className="h-64 rounded-md border">
            <div className="divide-y">
              {result.items.map((item) => (
                <div key={item.targetUserId} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{item.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.targetUserId}</div>
                      {!item.success && (
                        <div className="text-xs text-red-500 mt-0.5">{item.message}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {item.nextRole && (
                        <Badge variant="outline" className="text-[10px] h-5">{item.nextRole}</Badge>
                     )}
                     <Link href={`/admin/users/${item.targetUserId}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full sm:w-auto">Fechar Relatório</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
