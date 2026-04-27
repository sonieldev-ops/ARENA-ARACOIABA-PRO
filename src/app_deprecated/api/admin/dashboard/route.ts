import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/src/lib/auth/admin-guard";
import { adminDb } from "@/src/lib/firebase/admin";
import { sanitizeData } from "@/src/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await validateAdminSession(request);

    const [champs, teams, athletes, matches, pendingUsers] = await Promise.all([
      adminDb.collection("campeonatos").count().get(),
      adminDb.collection("times").count().get(),
      adminDb.collection("atletas").count().get(),
      adminDb.collection("partidas").where("status", "==", "LIVE").count().get(),
      adminDb.collection("usuarios").where("status", "==", "PENDING_APPROVAL").count().get(),
    ]);

    const recentActivity = await adminDb.collection("logs_auditoria")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    const activities = recentActivity.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json(sanitizeData({
      stats: {
        championships: champs.data().count,
        teams: teams.data().count,
        athletes: athletes.data().count,
        liveMatches: matches.data().count,
        pendingUsers: pendingUsers.data().count
      },
      recentActivity: activities
    }));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
