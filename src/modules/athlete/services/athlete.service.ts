import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import {
  AthleteDashboardData,
  AthleteStats,
  TeamInfo,
  MatchInfo,
  AthleteNotification
} from '@/src/types/athlete';
import { UserProfile } from '@/src/types/auth';

export class AthleteService {
  async getDashboardData(uid: string): Promise<AthleteDashboardData> {
    // 1. Buscar Perfil do Atleta
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) throw new Error('Athlete profile not found');
    const profile = { uid: userDoc.id, ...userDoc.data() } as UserProfile;

    // 2. Buscar Time (se houver teamId)
    let team: TeamInfo | null = null;
    if (profile.teamId) {
      const teamDoc = await getDoc(doc(db, 'teams', profile.teamId));
      if (teamDoc.exists()) {
        team = { id: teamDoc.id, ...teamDoc.data() } as TeamInfo;
      }
    }

    // 3. Buscar Próxima Partida
    let nextMatch: MatchInfo | null = null;
    if (profile.teamId) {
      const matchesRef = collection(db, 'matches');
      const qMatch = query(
        matchesRef,
        where('teamIds', 'array-contains', profile.teamId),
        where('status', '==', 'SCHEDULED'),
        orderBy('date', 'asc'),
        limit(1)
      );
      const matchSnap = await getDocs(qMatch);
      if (!matchSnap.empty) {
        nextMatch = { id: matchSnap.docs[0].id, ...matchSnap.docs[0].data() } as MatchInfo;
      }
    }

    // 4. Buscar Estatísticas (Mockadas para esta versão, mas estrutura pronta)
    const stats: AthleteStats = (userDoc.data()?.stats as AthleteStats) || {
      matches: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0
    };

    // 5. Buscar Notificações
    const notificationsRef = collection(db, `users/${uid}/notifications`);
    const qNotif = query(notificationsRef, orderBy('createdAt', 'desc'), limit(5));
    const notifSnap = await getDocs(qNotif);
    const notifications = notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as AthleteNotification));

    return {
      profile,
      team,
      nextMatch,
      stats,
      notifications
    };
  }
}

export const athleteService = new AthleteService();
