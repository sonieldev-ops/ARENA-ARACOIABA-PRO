const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function seed() {
  try {
    console.log('🚀 Iniciando Seed de dados...');

    // 1. Criar Campeonato
    const champRef = db.collection('championships').doc('copa-arena-2024');
    await champRef.set({
      name: 'Copa Arena Araçoiaba 2024',
      status: 'OPEN',
      startDate: admin.firestore.Timestamp.fromDate(new Date('2024-06-01')),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Campeonato criado.');

    // 2. Definir Times
    const teams = [
      { id: 'time-fla', name: 'Flamengo' },
      { id: 'time-pal', name: 'Palmeiras' },
      { id: 'time-spfc', name: 'São Paulo' },
      { id: 'time-gre', name: 'Grêmio' }
    ];

    for (const t of teams) {
      await db.collection('teams').doc(t.id).set({
        name: t.name,
        championshipId: 'copa-arena-2024',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Criar 3 atletas por time
      for (let i = 1; i <= 3; i++) {
        const athleteId = `ath-${t.id}-${i}`;
        await db.collection('athletes').doc(athleteId).set({
          fullName: `Atleta ${i} do ${t.name}`,
          teamId: t.id,
          teamName: t.name,
          number: 10 + i,
          status: 'ACTIVE',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    console.log('✅ 4 Times e 12 Atletas criados.');

    console.log('\n🔥 SEED FINALIZADO COM SUCESSO!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
