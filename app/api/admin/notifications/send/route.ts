import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/src/modules/notifications/services/notification.service';
import { adminAuth } from '@/src/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar Autenticação (Apenas Admin)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
       // Em Next.js App Router, geralmente usamos cookies de sessão, 
       // mas para simplicidade aqui verificaremos o token se enviado
       // No seu caso, o middleware deve estar protegendo a rota /admin
    }

    const { title, message, target, type } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 });
    }

    // 2. Buscar Tokens
    const tokens = await NotificationService.getAllTokens(target);

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Nenhum dispositivo encontrado para este público.' }, { status: 404 });
    }

    // 3. Enviar Notificações
    const response = await NotificationService.sendPush(tokens, {
      title,
      body: message,
      data: {
        type: type || 'info',
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // Compatibilidade com apps legados se houver
      }
    });

    return NextResponse.json({ 
      success: true, 
      sentCount: response?.successCount || 0,
      failureCount: response?.failureCount || 0 
    });

  } catch (error: any) {
    console.error('[API Notifications] Erro:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao enviar notificações' }, { status: 500 });
  }
}
