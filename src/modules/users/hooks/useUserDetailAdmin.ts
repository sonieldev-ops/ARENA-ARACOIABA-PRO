import { useState, useEffect, useCallback } from 'react';
import { UserDetailService } from '../services/user-detail.service';
import { UserProfile } from '@/src/types/auth';
import { AdminAuditLog } from '../types/user-detail.types';
import { toast } from 'sonner';

export function useUserDetailAdmin(uid: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await UserDetailService.getUserById(uid);
      if (!userData) {
        setError('Usuário não encontrado');
        return;
      }
      setUser(userData);
    } catch (err: any) {
      setError('Erro ao carregar perfil');
      toast.error('Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const auditData = await UserDetailService.getUserAuditLogs(uid);
      setLogs(auditData);
    } catch (err: any) {
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLogsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (uid) {
      fetchData();
      fetchLogs();
    }
  }, [uid, fetchData, fetchLogs]);

  return {
    user,
    logs,
    loading,
    logsLoading,
    error,
    refresh: fetchData,
    refreshLogs: fetchLogs
  };
}
