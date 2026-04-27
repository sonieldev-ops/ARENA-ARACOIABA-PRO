import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { usersAdminService } from "@/src/modules/admin/services/users-admin.service";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await validateAdminSession(request);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;

    const data = await usersAdminService.list({ role, status });
    return NextResponse.json(sanitizeData(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await validateAdminSession(request);
    const body = await request.json();
    const { userId, role, status, reason } = body;

    if (role) {
      await usersAdminService.updateUserRole(userId, role, session.uid);
    }

    if (status) {
      await usersAdminService.updateUserStatus(userId, status, session.uid, reason);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
