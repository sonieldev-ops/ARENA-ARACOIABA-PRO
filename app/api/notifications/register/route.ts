import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { userId, token, platform } = await req.json();

    if (!userId || !token) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await adminDb.collection('fcm_tokens').doc(token).set({
      userId,
      token,
      platform: platform || 'android',
      active: true,
      lastUpdated: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
