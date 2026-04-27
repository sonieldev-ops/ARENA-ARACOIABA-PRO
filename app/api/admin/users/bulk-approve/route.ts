import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { bulkApproveUsers } from '@/lib/auth/admin-actions';
import { UserRole } from '@/src/types/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== UserRole.SUPER_ADMIN && session.role !== UserRole.ORGANIZER)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { targetUserIds } = await req.json();
    if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
      return NextResponse.json({ error: 'targetUserIds deve ser um array não vazio' }, { status: 400 });
    }

    const result = await bulkApproveUsers(session.id, targetUserIds);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Erro ao aprovar usuários em lote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
