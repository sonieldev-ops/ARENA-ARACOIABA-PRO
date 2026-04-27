import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { approveUser } from '@/lib/auth/admin-actions';
import { UserRole } from '@/src/types/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== UserRole.SUPER_ADMIN && session.role !== UserRole.ORGANIZER)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId é obrigatório' }, { status: 400 });
    }

    const result = await approveUser(session.id, targetUserId);

    return NextResponse.json({ success: true, user: result });
  } catch (error: any) {
    console.error('Erro ao aprovar usuário:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
