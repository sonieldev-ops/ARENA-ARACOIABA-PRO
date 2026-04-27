import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { teamAdminService } from "@/src/modules/team/services/team-admin.service";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const data = await teamAdminService.list();
    return NextResponse.json(sanitizeData(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const body = await request.json();
    const result = await teamAdminService.create(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
