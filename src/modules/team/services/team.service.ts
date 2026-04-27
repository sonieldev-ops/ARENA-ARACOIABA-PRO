import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase/client';
import { Team, TeamMember, TeamInvite, Competition, TeamDashboardData } from '../types/team.types';

export class TeamService {
  // 1. Buscar Dados do Dashboard
  async getDashboardData(managerUid: string): Promise<TeamDashboardData> {
    // Buscar time onde o usuário é Manager
    const teamsRef = collection(db, 'teams');
    const qTeam = query(teamsRef, where('managerId', '==', managerUid));
    const teamSnap = await getDocs(qTeam);

    if (teamSnap.empty) {
      return { team: null, members: [], invites: [], availableCompetitions: [] };
    }

    const teamDoc = teamSnap.docs[0];
    const team = { id: teamDoc.id, ...teamDoc.data() } as Team;

    // Buscar Elenco
    const membersRef = collection(db, `teams/${team.id}/members`);
    const membersSnap = await getDocs(membersRef);
    const members = membersSnap.docs.map(d => ({ ...d.data() } as TeamMember));

    // Buscar Convites Ativos
    const invitesRef = collection(db, 'teamInvites');
    const qInvites = query(invitesRef, where('teamId', '==', team.id), where('status', '==', 'PENDING'));
    const invitesSnap = await getDocs(qInvites);
    const invites = invitesSnap.docs.map(d => ({ id: d.id, ...d.data() } as TeamInvite));

    // Buscar Campeonatos Abertos
    const compRef = collection(db, 'competitions');
    const qComp = query(compRef, where('status', '==', 'OPEN_REGISTRATION'));
    const compSnap = await getDocs(qComp);
    const availableCompetitions = compSnap.docs.map(d => ({ id: d.id, ...d.data() } as Competition));

    return { team, members, invites, availableCompetitions };
  }

  // 2. Enviar Convite
  async sendInvite(team: Team, email: string, role: string): Promise<void> {
    const invitesRef = collection(db, 'teamInvites');
    await addDoc(invitesRef, {
      teamId: team.id,
      teamName: team.name,
      invitedEmail: email,
      role,
      status: 'PENDING',
      createdAt: serverTimestamp()
    });
  }

  // 3. Remover Jogador do Elenco
  async removeMember(teamId: string, userId: string): Promise<void> {
    const memberDoc = doc(db, `teams/${teamId}/members`, userId);
    await deleteDoc(memberDoc);

    // Também remover o teamId do perfil do usuário para consistência
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { teamId: null });
  }

  // 4. Inscrição em Campeonato
  async registerInCompetition(teamId: string, competitionId: string): Promise<void> {
    const regRef = collection(db, `competitions/${competitionId}/registrations`);
    await addDoc(regRef, {
      teamId,
      registeredAt: serverTimestamp(),
      status: 'PENDING_PAYMENT'
    });
  }
}

export const teamService = new TeamService();
