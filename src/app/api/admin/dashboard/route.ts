import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);

    const [champs, teams, athletes, matches, pendingUsers] = await Promise.all([
      adminDb.collection("championships").count().get(),
      adminDb.collection("teams").count().get(),
      adminDb.collection("athletes").count().get(),
      adminDb.collection("matches").where("status", "==", "LIVE").count().get(),
      adminDb.collection("users").where("status", "==", "PENDING_APPROVAL").count().get(),
    ]);

    const recentActivity = await adminDb.collection("adminAuditLogs")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const activities = recentActivity.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString()
    }));

    return NextResponse.json({
      stats: {
        championships: champs.data().count,
        teams: teams.data().count,
        athletes: athletes.data().count,
        liveMatches: matches.data().count,
        pendingUsers: pendingUsers.data().count
      },
      recentActivity: activities
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
