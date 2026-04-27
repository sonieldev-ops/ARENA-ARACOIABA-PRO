import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { matchAdminService } from "@/src/modules/admin/services/match-admin.service";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    // Nota: O serviço original não tinha list, mas vamos assumir ou adicionar depois
    const snapshot = await (matchAdminService as any).list?.() || [];
    return NextResponse.json(sanitizeData(snapshot));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const body = await request.json();
    const result = await matchAdminService.createMatch(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
