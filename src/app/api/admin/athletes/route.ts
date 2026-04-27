import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { athleteAdminService } from "@/src/modules/athlete/services/athlete-admin.service";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const data = await athleteAdminService.list();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await validateAdminSession(request);
    const body = await request.json();
    const result = await athleteAdminService.create(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
