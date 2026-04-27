import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './client';

export const functions = getFunctions(app);

// Callables Administrativos
export const approveUserFn = httpsCallable(functions, 'approveUser');
export const rejectUserFn = httpsCallable(functions, 'rejectUser');
export const changeUserAccessFn = httpsCallable(functions, 'changeUserAccess');
