import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { rejectUser } from '@/lib/auth/admin-actions';
import { UserRole } from '@/src/types/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== UserRole.SUPER_ADMIN && session.role !== UserRole.ORGANIZER)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { targetUserId, reason } = await req.json();
    if (!targetUserId || !reason) {
      return NextResponse.json({ error: 'targetUserId e reason são obrigatórios' }, { status: 400 });
    }

    const result = await rejectUser(session.id, targetUserId, reason);

    return NextResponse.json({ success: true, user: result });
  } catch (error: any) {
    console.error('Erro ao rejeitar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
