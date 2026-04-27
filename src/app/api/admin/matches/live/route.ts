import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { registerGoal, startMatch, finishMatch } from "@/src/modules/admin/services/match-execution.service";

export async function POST(request: NextRequest) {
  try {
    await validateAdminSession(request, ['SUPER_ADMIN', 'REFEREE', 'ORGANIZER']);
    const body = await request.json();
    const { action, matchId, ...data } = body;

    switch (action) {
      case 'START':
        await startMatch(matchId);
        break;
      case 'GOAL':
        await registerGoal(matchId, data.teamId, data.athleteId, data.minute);
        break;
      case 'FINISH':
        await finishMatch(matchId);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
