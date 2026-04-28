import { NotificationType, NotificationPriority } from '../types/notification.types';

export interface NotificationTemplate {
  title: string;
  body: string;
  priority: NotificationPriority;
}

export const ADMIN_NOTIFICATION_TEMPLATES: Record<NotificationType, (data: any) => NotificationTemplate> = {
  [NotificationType.USER_APPROVED]: (data) => ({
    title: 'Seu acesso foi aprovado! 🚀',
    body: `Olá ${data.fullName}, seu cadastro na Arena Aracoiaba Pro foi aprovado como ${data.nextRole}. Bem-vindo!`,
    priority: NotificationPriority.HIGH
  }),
  [NotificationType.USER_REJECTED]: (data) => ({
    title: 'Solicitação de acesso recusada',
    body: `Olá ${data.fullName}, infelizmente sua solicitação não foi aprovada neste momento. ${data.reason ? `Motivo: ${data.reason}` : ''}`,
    priority: NotificationPriority.NORMAL
  }),
  [NotificationType.USER_ROLE_CHANGED]: (data) => ({
    title: 'Seu perfil foi atualizado',
    body: `Seu nível de acesso foi alterado de ${data.previousRole} para ${data.nextRole}.`,
    priority: NotificationPriority.NORMAL
  }),
  [NotificationType.USER_SUSPENDED]: (data) => ({
    title: 'Aviso: Seu acesso foi suspenso',
    body: `Prezado ${data.fullName}, seu acesso está temporariamente suspenso. ${data.reason ? `Motivo: ${data.reason}` : ''}`,
    priority: NotificationPriority.CRITICAL
  }),
  [NotificationType.USER_BLOCKED]: (data) => ({
    title: 'Acesso Bloqueado',
    body: `Seu acesso à plataforma foi bloqueado. Entre em contato com o suporte para mais informações.`,
    priority: NotificationPriority.CRITICAL
  }),
  [NotificationType.USER_REACTIVATED]: (data) => ({
    title: 'Seu acesso foi reativado',
    body: `Boas notícias! Seu acesso à Arena Aracoiaba Pro foi reestabelecido.`,
    priority: NotificationPriority.HIGH
  }),
  [NotificationType.USER_STATUS_CHANGED]: (data) => ({
    title: 'Atualização de Status',
    body: `O status da sua conta foi alterado para ${data.nextStatus}.`,
    priority: NotificationPriority.NORMAL
  }),
  [NotificationType.SYSTEM_ALERT]: (data) => ({
    title: data.title || 'Alerta do Sistema',
    body: data.message || '',
    priority: data.priority || NotificationPriority.NORMAL
  }),
  [NotificationType.MATCH_UPDATE]: (data) => ({
    title: 'Atualização de Partida',
    body: data.message || 'Houve uma atualização na sua partida.',
    priority: NotificationPriority.NORMAL
  }),
  [NotificationType.MATCH_GOAL]: (data) => ({
    title: 'GOOOOOOOL! ⚽',
    body: `${data.teamName} marcou aos ${data.minute}'! Autor: ${data.playerName}`,
    priority: NotificationPriority.HIGH
  }),
  [NotificationType.MATCH_CARD]: (data) => ({
    title: `${data.cardType === 'RED' ? 'Cartão Vermelho! 🟥' : 'Cartão Amarelo 🟨'}`,
    body: `${data.playerName} (${data.teamName}) recebeu aos ${data.minute}'.`,
    priority: NotificationPriority.NORMAL
  }),
  [NotificationType.CHAMPIONSHIP_ALERT]: (data) => ({
    title: 'Alerta de Campeonato',
    body: data.message || 'Novidades no seu campeonato.',
    priority: NotificationPriority.HIGH
  }),
  [NotificationType.SYSTEM_NOTICE]: (data) => ({
    title: 'Aviso do Sistema',
    body: data.message || 'Comunicado importante.',
    priority: NotificationPriority.LOW
  }),
  [NotificationType.GENERIC]: (data) => ({
    title: data.title || 'Notificação',
    body: data.body || '',
    priority: data.priority || NotificationPriority.NORMAL
  })
};
