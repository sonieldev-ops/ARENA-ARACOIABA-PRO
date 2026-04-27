import { useState } from 'react';
import { UserProfile } from '@/src/types/auth';
import { BulkActionType, BulkOperationResult } from '../types/user-bulk.types';
import { usersBulkService } from '../services/users-bulk.service';
import { toast } from 'sonner';

export function useUserBulkActions(selectedUsers: UserProfile[], onComplete?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null);

  const [activeModal, setActiveModal] = useState<BulkActionType | 'RESULT' | null>(null);

  const targetUserIds = selectedUsers.map(u => u.uid);

  const handleBulkApprove = async () => {
    try {
      setIsProcessing(true);
      const result = await usersBulkService.bulkApprove({ targetUserIds });
      setLastResult(result);
      setActiveModal('RESULT');
      toast.success(`Operação concluída: ${result.totalSucceeded} aprovados.`);
      onComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar aprovação em lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async (reason: string) => {
    try {
      setIsProcessing(true);
      const result = await usersBulkService.bulkReject({ targetUserIds, reason });
      setLastResult(result);
      setActiveModal('RESULT');
      toast.success(`Operação concluída: ${result.totalSucceeded} rejeitados.`);
      onComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar rejeição em lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkChangeAccess = async (data: { nextRole?: any, nextStatus?: any, reason?: string, revokeSessions?: boolean }) => {
    try {
      setIsProcessing(true);
      const result = await usersBulkService.bulkChangeAccess({
        targetUserIds,
        ...data
      });
      setLastResult(result);
      setActiveModal('RESULT');
      toast.success(`Operação concluída: ${result.totalSucceeded} atualizados.`);
      onComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar alteração em lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    if (activeModal === 'RESULT') {
       setLastResult(null);
    }
  };

  return {
    isProcessing,
    lastResult,
    activeModal,
    setActiveModal,
    closeModal,
    handleBulkApprove,
    handleBulkReject,
    handleBulkChangeAccess,
    selectedCount: selectedUsers.length
  };
}
