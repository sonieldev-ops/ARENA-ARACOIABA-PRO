'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserProfile, UserStatus } from '@/src/types/auth';

export default function PendingUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('status', '==', UserStatus.PENDING_APPROVAL)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (!res.ok) throw new Error('Erro ao aprovar');
      alert('Usuário aprovado com sucesso!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      const res = await fetch('/api/admin/users/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, reason }),
      });
      if (!res.ok) throw new Error('Erro ao rejeitar');
      alert('Usuário rejeitado.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Usuários Pendentes de Aprovação</h1>
      {users.length === 0 ? (
        <p>Nenhum usuário pendente.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nome</th>
                <th className="py-2 px-4 border-b">E-mail</th>
                <th className="py-2 px-4 border-b">Papel Solicitado</th>
                <th className="py-2 px-4 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="py-2 px-4 border-b">{user.fullName}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">{(user as any).requestedRole}</td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button
                      onClick={() => handleApprove(user.uid)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(user.uid)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Rejeitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
