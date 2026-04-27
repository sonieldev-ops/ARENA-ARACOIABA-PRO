const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Config
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
const auth = admin.auth();

async function setAdmin(email) {
  try {
    console.log(`Buscando usuário: ${email}`);
    const user = await auth.getUserByEmail(email);
    const uid = user.uid;

    console.log(`Usuário encontrado: ${uid}. Atualizando para SUPER_ADMIN...`);

    // 1. Claims
    await auth.setCustomUserClaims(uid, {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
      accessVersion: 1
    });

    // 2. Firestore
    await db.collection('users').doc(uid).set({
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
      approvalRequired: false,
      accessVersion: 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`✅ Sucesso! sonieloficial@gmail.com agora é SUPER_ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

setAdmin('sonieloficial@gmail.com');
